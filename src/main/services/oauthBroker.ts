import { createServer, type Server, type IncomingMessage, type ServerResponse } from 'node:http';
import { randomBytes, createHash } from 'node:crypto';
import { shell } from 'electron';
import log from 'electron-log/main';

/**
 * OAuth 2.0 loopback broker for desktop apps.
 *
 * Pattern (per https://developers.google.com/identity/protocols/oauth2/native-app):
 *   1. Bind a fresh ephemeral port on 127.0.0.1.
 *   2. Build the authorization URL with `redirect_uri =
 *      http://127.0.0.1:<port>/oauth/<service>/callback`.
 *   3. Open the URL in the user's default browser via `shell.openExternal`.
 *   4. Browser redirects back to our loopback once the user consents.
 *   5. We capture `code` + `state`, validate, render a "you can close this tab" page.
 *   6. Caller exchanges the code for tokens using its own platform-specific exchanger.
 *
 * One server instance per pending auth — torn down as soon as the callback
 * arrives or we time out. Never reuses the agent-api server (different port,
 * different auth model).
 */

export interface OAuthCallback {
  code: string;
  state: string;
  /** All extra query params on the redirect (Shopee returns shop_id, some
   *  providers return additional context). Excludes `code` and `state`. */
  extra: Record<string, string>;
}

export interface BeginOAuthResult {
  authUrl: string;
  state: string;
  /** PKCE verifier the caller passes to its token-exchange endpoint. */
  codeVerifier?: string;
  redirectUri: string;
  /** Resolves once the user finishes consent. Rejects on timeout / provider error. */
  callback: Promise<OAuthCallback>;
}

export interface BuildAuthUrlContext {
  redirectUri: string;
  state: string;
  codeChallenge?: string;
  scopes: string[];
}

interface BeginOptions {
  service: string;
  scopes: string[];
  /** Default `true` — produces a PKCE code_verifier + S256 challenge. */
  pkce?: boolean;
  /** Builds the consent URL given the redirect+state+challenge. */
  buildAuthUrl: (ctx: BuildAuthUrlContext) => string;
  /** How long to wait for the user to finish before rejecting. Default 10 min. */
  timeoutMs?: number;
}

const DEFAULT_TIMEOUT_MS = 10 * 60 * 1000;

function pkcePair(): { verifier: string; challenge: string } {
  // 64 bytes → 86-char base64url verifier (within the 43..128 spec range).
  const verifier = randomBytes(64).toString('base64url');
  const challenge = createHash('sha256').update(verifier).digest('base64url');
  return { verifier, challenge };
}

function renderResultPage(ok: boolean, message: string): string {
  const color = ok ? '#2e7d32' : '#c62828';
  return `<!doctype html>
<html><head><meta charset="utf-8"><title>King — OAuth</title>
<style>
body{font-family:system-ui,-apple-system,sans-serif;background:#fff8e0;color:#231f20;display:flex;align-items:center;justify-content:center;height:100vh;margin:0}
.card{background:#fff;border-radius:16px;padding:32px 40px;box-shadow:0 4px 24px rgba(0,0,0,.08);max-width:420px;text-align:center}
h1{margin:0 0 12px;color:${color};font-size:22px}
p{margin:0;color:#5b4a3f;line-height:1.5}
</style></head>
<body><div class="card"><h1>${ok ? 'Connected' : 'Connection failed'}</h1><p>${message}</p><p style="margin-top:16px;font-size:13px;color:#9c7d6a">You can close this tab and return to King.</p></div></body></html>`;
}

/**
 * Start a one-shot OAuth flow.
 *
 * Resolves once the loopback server is bound and the consent URL has been
 * launched in the default browser. The `.callback` promise on the result
 * resolves when the user finishes consent (or rejects on timeout / error).
 */
export async function beginOAuth(opts: BeginOptions): Promise<BeginOAuthResult> {
  const state = randomBytes(24).toString('base64url');
  const usePkce = opts.pkce !== false;
  const { verifier, challenge } = usePkce
    ? pkcePair()
    : { verifier: undefined, challenge: undefined };

  const server: Server = createServer();
  server.unref();

  let resolveCb!: (v: OAuthCallback) => void;
  let rejectCb!: (e: Error) => void;
  const callback = new Promise<OAuthCallback>((res, rej) => {
    resolveCb = res;
    rejectCb = rej;
  });

  let resolved = false;
  const timeoutHandle = setTimeout(() => {
    if (resolved) return;
    resolved = true;
    server.close();
    rejectCb(new Error('OAuth flow timed out.'));
  }, opts.timeoutMs ?? DEFAULT_TIMEOUT_MS);
  timeoutHandle.unref();

  function finish(ok: boolean, payload?: OAuthCallback, err?: Error): void {
    if (resolved) return;
    resolved = true;
    clearTimeout(timeoutHandle);
    // Tear down the server after the browser has received its response.
    setTimeout(() => server.close(), 100).unref();
    if (ok && payload) resolveCb(payload);
    else rejectCb(err ?? new Error('OAuth flow failed.'));
  }

  server.on('request', (req: IncomingMessage, res: ServerResponse) => {
    const url = new URL(req.url ?? '/', 'http://127.0.0.1');
    const expectedPath = `/oauth/${opts.service}/callback`;
    if (url.pathname !== expectedPath) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not found');
      return;
    }
    const params = url.searchParams;
    const error = params.get('error');
    if (error) {
      const description = params.get('error_description') || error;
      res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(renderResultPage(false, description));
      finish(false, undefined, new Error(`OAuth provider error: ${description}`));
      return;
    }
    const code = params.get('code');
    const returnedState = params.get('state');
    if (!code || !returnedState) {
      res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(renderResultPage(false, 'Missing code or state.'));
      finish(false, undefined, new Error('OAuth callback missing code or state'));
      return;
    }
    if (returnedState !== state) {
      res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(renderResultPage(false, 'State mismatch.'));
      finish(false, undefined, new Error('OAuth state mismatch'));
      return;
    }
    const extra: Record<string, string> = {};
    for (const [k, v] of params) {
      if (k !== 'code' && k !== 'state') extra[k] = v;
    }
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(renderResultPage(true, 'Returning you to King.'));
    finish(true, { code, state: returnedState, extra });
  });

  server.on('error', (err) => {
    log.error('[oauth] server error', err);
    finish(false, undefined, err);
  });

  const port = await new Promise<number>((resolvePort, rejectPort) => {
    server.once('error', rejectPort);
    server.listen(0, '127.0.0.1', () => {
      const addr = server.address();
      if (!addr || typeof addr === 'string') {
        rejectPort(new Error('OAuth server failed to bind'));
        return;
      }
      resolvePort(addr.port);
    });
  });

  const redirectUri = `http://127.0.0.1:${port}/oauth/${opts.service}/callback`;
  const authUrl = opts.buildAuthUrl({
    redirectUri,
    state,
    codeChallenge: challenge,
    scopes: opts.scopes,
  });

  // Open consent in the user's default browser. NOT inside Electron — most
  // providers refuse to render their consent UI inside an embedded webview.
  await shell.openExternal(authUrl);

  return { authUrl, state, codeVerifier: verifier, redirectUri, callback };
}
