import { createServer, type IncomingMessage, type Server, type ServerResponse } from 'node:http';
import { randomBytes } from 'node:crypto';
import { join } from 'node:path';
import log from 'electron-log/main';
import { app } from 'electron';
import { writeJsonAtomic, readJson } from './atomicJson';
import { getFacebookCredentials, resolveAdAccountId } from './facebookCredentials';
import {
  listAdAccounts,
  listPages,
  listCampaigns,
  listAdSets,
  createAdEndToEnd,
  FacebookApiError,
  type EndToEndInput,
  type FbCtaType,
  type FbObjective,
} from './facebookAdsClient';

/**
 * Loopback HTTP server that exposes the same Facebook Ads operations as the
 * IPC bridge, so a coding agent can drive them via curl. Bound exclusively
 * to 127.0.0.1; bearer-token gated with a 32-byte hex secret persisted to
 * `<userData>/agent-api.json` so external scripts can read it.
 */

interface AgentApiFile {
  port: number;
  token: string;
  baseUrl: string;
  pid: number;
  startedAt: string;
}

let server: Server | null = null;
let bearerToken: string | null = null;
let publishedFile: string | null = null;

function getStateFilePath(): string {
  return join(app.getPath('userData'), 'agent-api.json');
}

function loadOrCreateToken(): string {
  const path = getStateFilePath();
  const existing = readJson<Partial<AgentApiFile>>(path, {});
  if (typeof existing.token === 'string' && existing.token.length === 64) {
    return existing.token;
  }
  return randomBytes(32).toString('hex');
}

// ------ Helpers ----------------------------------------------------------

function sendJson(res: ServerResponse, status: number, body: unknown): void {
  const data = JSON.stringify(body);
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data),
  });
  res.end(data);
}

function sendError(res: ServerResponse, status: number, message: string, extra?: unknown): void {
  sendJson(res, status, { error: { message, ...(extra ? { detail: extra } : {}) } });
}

async function readJsonBody<T>(req: IncomingMessage, maxBytes = 25 * 1024 * 1024): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const chunks: Buffer[] = [];
    let total = 0;
    req.on('data', (chunk: Buffer) => {
      total += chunk.length;
      if (total > maxBytes) {
        req.destroy();
        reject(new Error(`Body too large (> ${maxBytes} bytes)`));
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => {
      if (chunks.length === 0) {
        resolve({} as T);
        return;
      }
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString('utf-8')) as T);
      } catch (e) {
        reject(e instanceof Error ? e : new Error(String(e)));
      }
    });
    req.on('error', reject);
  });
}

function isLoopback(req: IncomingMessage): boolean {
  // The OS already enforces this since we bind to 127.0.0.1, but defence in
  // depth: refuse anything that somehow arrives from elsewhere.
  const addr = req.socket.remoteAddress ?? '';
  return addr === '127.0.0.1' || addr === '::1' || addr === '::ffff:127.0.0.1';
}

function checkAuth(req: IncomingMessage): boolean {
  const header = req.headers['authorization'];
  if (typeof header !== 'string') return false;
  const m = /^Bearer\s+(.+)$/.exec(header);
  if (!m) return false;
  return m[1] === bearerToken;
}

function requireCreds() {
  const creds = getFacebookCredentials();
  if (!creds) {
    throw new FacebookApiError('Facebook is not connected. Save an access token in API Keys.', {
      code: 401,
    });
  }
  return creds;
}

async function fetchImageBytes(input: {
  imageBase64?: string;
  imageUrl?: string;
  filename?: string;
}): Promise<{ bytes: Buffer; filename: string }> {
  if (input.imageBase64) {
    const base = input.imageBase64.includes(',')
      ? input.imageBase64.split(',', 2)[1]!
      : input.imageBase64;
    return { bytes: Buffer.from(base, 'base64'), filename: input.filename ?? 'upload.png' };
  }
  if (input.imageUrl) {
    const res = await fetch(input.imageUrl);
    if (!res.ok) throw new Error(`Failed to download imageUrl: HTTP ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    const guessed = input.imageUrl.split('/').pop() || 'upload.png';
    return { bytes: buf, filename: input.filename ?? guessed };
  }
  throw new Error('Provide image as imageBase64 or imageUrl');
}

// ------ Route handlers ---------------------------------------------------

interface CreateAdBody {
  adAccountId?: string;
  pageId?: string;
  campaignId?: string;
  newCampaign?: { name: string; objective: FbObjective };
  adSetId?: string;
  newAdSet?: {
    name: string;
    dailyBudget: number;
    countries: string[];
    ageMin: number;
    ageMax: number;
  };
  ad: {
    name: string;
    headline: string;
    message: string;
    link: string;
    ctaType: FbCtaType;
    status?: 'ACTIVE' | 'PAUSED';
  };
  imageBase64?: string;
  imageUrl?: string;
  imageFilename?: string;
}

async function handleRequest(req: IncomingMessage, res: ServerResponse): Promise<void> {
  if (!isLoopback(req)) {
    sendError(res, 403, 'Forbidden: non-loopback request');
    return;
  }

  const url = new URL(req.url ?? '/', 'http://127.0.0.1');
  const path = url.pathname;
  const method = (req.method ?? 'GET').toUpperCase();

  // Health is unauthenticated so curl smoke tests work without juggling tokens.
  if (path === '/v1/health' && method === 'GET') {
    sendJson(res, 200, { ok: true, service: 'king-agent-api', version: 1 });
    return;
  }

  if (!checkAuth(req)) {
    sendError(res, 401, 'Unauthorized: missing or invalid bearer token');
    return;
  }

  try {
    if (path === '/v1/facebook-ads/status' && method === 'GET') {
      const creds = getFacebookCredentials();
      sendJson(res, 200, {
        connected: !!creds,
        defaultAdAccountId: creds?.defaultAdAccountId,
        defaultPageId: creds?.defaultPageId,
      });
      return;
    }

    if (path === '/v1/facebook-ads/ad-accounts' && method === 'GET') {
      const accounts = await listAdAccounts(requireCreds());
      sendJson(res, 200, { data: accounts });
      return;
    }

    if (path === '/v1/facebook-ads/pages' && method === 'GET') {
      const pages = await listPages(requireCreds());
      sendJson(res, 200, { data: pages });
      return;
    }

    if (path === '/v1/facebook-ads/campaigns' && method === 'GET') {
      const creds = requireCreds();
      const id = resolveAdAccountId(creds, url.searchParams.get('ad_account_id') ?? undefined);
      const campaigns = await listCampaigns(creds, id);
      sendJson(res, 200, { data: campaigns });
      return;
    }

    if (path === '/v1/facebook-ads/adsets' && method === 'GET') {
      const creds = requireCreds();
      const id = resolveAdAccountId(creds, url.searchParams.get('ad_account_id') ?? undefined);
      const campaignId = url.searchParams.get('campaign_id') ?? undefined;
      const adsets = await listAdSets(creds, id, campaignId);
      sendJson(res, 200, { data: adsets });
      return;
    }

    if (path === '/v1/facebook-ads/ads' && method === 'POST') {
      const body = await readJsonBody<CreateAdBody>(req);
      const creds = requireCreds();
      const adAccountId = resolveAdAccountId(creds, body.adAccountId);
      const pageId = body.pageId?.trim() || creds.defaultPageId;
      if (!pageId) {
        sendError(res, 400, 'No page selected. Pass pageId or save a default.');
        return;
      }

      const image = await fetchImageBytes({
        imageBase64: body.imageBase64,
        imageUrl: body.imageUrl,
        filename: body.imageFilename,
      });

      const e2e: EndToEndInput = {
        ...(body.campaignId
          ? { campaignId: body.campaignId }
          : body.newCampaign
            ? {
                campaign: {
                  name: body.newCampaign.name,
                  objective: body.newCampaign.objective,
                  specialAdCategories: [],
                },
              }
            : {}),
        ...(body.adSetId
          ? { adSetId: body.adSetId }
          : body.newAdSet
            ? {
                adSet: {
                  name: body.newAdSet.name,
                  dailyBudget: body.newAdSet.dailyBudget,
                  targeting: {
                    countries: body.newAdSet.countries,
                    ageMin: body.newAdSet.ageMin,
                    ageMax: body.newAdSet.ageMax,
                  },
                },
              }
            : {}),
        pageId,
        image: { bytes: image.bytes, filename: image.filename },
        creative: {
          name: body.ad.name,
          message: body.ad.message,
          headline: body.ad.headline,
          link: body.ad.link,
          ctaType: body.ad.ctaType,
        },
        ad: { name: body.ad.name, status: body.ad.status ?? 'PAUSED' },
      };

      const result = await createAdEndToEnd(creds, adAccountId, e2e);
      sendJson(res, 200, { ...result, adAccountId });
      return;
    }

    sendError(res, 404, `Not found: ${method} ${path}`);
  } catch (err) {
    if (err instanceof FacebookApiError) {
      const status =
        typeof err.code === 'number' && err.code >= 400 && err.code < 600 ? err.code : 400;
      sendError(res, status, err.message, { code: err.code, fbtraceId: err.fbtraceId });
      return;
    }
    log.error('[agent-api] handler error', err);
    sendError(res, 500, err instanceof Error ? err.message : 'Internal error');
  }
}

// ------ Lifecycle --------------------------------------------------------

export function startAgentApiServer(): void {
  if (server) return;
  bearerToken = loadOrCreateToken();

  server = createServer((req, res) => {
    void handleRequest(req, res).catch((err) => {
      log.error('[agent-api] unhandled', err);
      try {
        sendError(res, 500, 'Internal error');
      } catch {
        /* response already sent */
      }
    });
  });

  server.on('error', (err) => log.error('[agent-api] server error', err));

  // 127.0.0.1 + port 0 → kernel-assigned ephemeral port. Never bind to all
  // interfaces; only the local user should reach this.
  server.listen(0, '127.0.0.1', () => {
    const addr = server?.address();
    if (!addr || typeof addr === 'string') {
      log.error('[agent-api] failed to read bound address');
      return;
    }
    const filePath = getStateFilePath();
    const payload: AgentApiFile = {
      port: addr.port,
      token: bearerToken!,
      baseUrl: `http://127.0.0.1:${addr.port}`,
      pid: process.pid,
      startedAt: new Date().toISOString(),
    };
    try {
      writeJsonAtomic(filePath, payload);
      publishedFile = filePath;
    } catch (err) {
      log.error('[agent-api] failed to write state file', err);
    }
    log.info(`[agent-api] listening on http://127.0.0.1:${addr.port} (token at ${filePath})`);
  });
}

export function stopAgentApiServer(): Promise<void> {
  return new Promise((resolve) => {
    if (!server) {
      resolve();
      return;
    }
    server.close(() => {
      server = null;
      bearerToken = null;
      log.info('[agent-api] stopped', { file: publishedFile });
      resolve();
    });
  });
}
