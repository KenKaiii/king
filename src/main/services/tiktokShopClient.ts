import { createHmac } from 'node:crypto';
import { beginOAuth } from './oauthBroker';
import { withFreshToken } from './tokenRefresh';
import {
  getTikTokShopCredentials,
  setTikTokShopCredentials,
  type TikTokShopCredentials,
} from './tiktokShopCredentials';

/**
 * TikTok Shop Open API client.
 *
 * Auth model (https://partner.tiktokshop.com/docv2/page/authorization-guide-202309):
 *   - OAuth 2.0 → access_token + refresh_token + shop_cipher (per-shop opaque ID)
 *   - All API calls signed: HMAC-SHA256 over a sorted concatenation of
 *     non-`sign`/non-`access_token` query params + `path` + body, keyed
 *     with App Secret.
 *     https://partner.tiktokshop.com/docv2/page/sign-your-api-request
 *
 * One-time developer registration (env at runtime):
 *   TIKTOK_SHOP_APP_KEY      — from Partner Center
 *   TIKTOK_SHOP_APP_SECRET   — same; ships with binary, not truly secret.
 *
 * Endpoint host varies by environment; sandbox uses a different domain
 * documented in Partner Center but typed identically.
 */

const API_BASE = 'https://open-api.tiktokglobalshop.com';
const AUTH_BASE = 'https://auth.tiktok-shops.com';

function appKey(): string {
  return process.env.TIKTOK_SHOP_APP_KEY ?? '';
}
function appSecret(): string {
  return process.env.TIKTOK_SHOP_APP_SECRET ?? '';
}

export class TikTokApiError extends Error {
  code?: number | string;
  constructor(message: string, code?: number | string) {
    super(message);
    this.name = 'TikTokApiError';
    this.code = code;
  }
}

// ------ Signing ----------------------------------------------------------

/**
 * Concatenate `path` + sorted non-excluded params + raw JSON body, then HMAC.
 * Excluded keys per spec: `sign`, `access_token`.
 */
function signRequest(
  path: string,
  params: Record<string, string | number | undefined>,
  rawBody?: string,
): string {
  const filtered: Array<[string, string]> = [];
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined) continue;
    if (k === 'sign' || k === 'access_token') continue;
    filtered.push([k, String(v)]);
  }
  filtered.sort(([a], [b]) => a.localeCompare(b));
  let baseString = appSecret() + path;
  for (const [k, v] of filtered) baseString += k + v;
  if (rawBody && rawBody.length > 0) baseString += rawBody;
  baseString += appSecret();
  return createHmac('sha256', appSecret()).update(baseString).digest('hex');
}

interface SignedFetchInput {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  query?: Record<string, string | number | undefined>;
  body?: unknown;
}

async function signedFetch(
  creds: TikTokShopCredentials,
  input: SignedFetchInput,
): Promise<{ response: Response; creds: TikTokShopCredentials }> {
  return withFreshToken<TikTokShopCredentials>({
    lockKey: 'tiktok-shop',
    current: creds,
    refresh: refreshAccessToken,
    save: setTikTokShopCredentials,
    call: async (token) => {
      const timestamp = Math.floor(Date.now() / 1000);
      const params: Record<string, string | number | undefined> = {
        app_key: appKey(),
        timestamp,
        version: '202309',
        shop_cipher: creds.shopCipher,
        ...(input.query ?? {}),
      };
      const rawBody = input.body !== undefined ? JSON.stringify(input.body) : undefined;
      const sign = signRequest(input.path, params, rawBody);
      const url = new URL(`${API_BASE}${input.path}`);
      for (const [k, v] of Object.entries(params)) {
        if (v !== undefined) url.searchParams.set(k, String(v));
      }
      url.searchParams.set('sign', sign);
      url.searchParams.set('access_token', token);
      return fetch(url.toString(), {
        method: input.method,
        headers: rawBody
          ? { 'Content-Type': 'application/json', 'x-tts-access-token': token }
          : { 'x-tts-access-token': token },
        body: rawBody,
      });
    },
  });
}

async function readJson<T>(response: Response): Promise<T> {
  const text = await response.text();
  let body: { code?: number; message?: string; data?: T };
  try {
    body = JSON.parse(text);
  } catch {
    throw new TikTokApiError(`Non-JSON response (${response.status})`, response.status);
  }
  if (body.code && body.code !== 0) {
    throw new TikTokApiError(body.message ?? `TikTok error ${body.code}`, body.code);
  }
  if (!response.ok) throw new TikTokApiError(`HTTP ${response.status}`, response.status);
  return (body.data ?? (body as unknown as T)) as T;
}

// ------ OAuth ------------------------------------------------------------

async function exchangeCode(code: string): Promise<{
  access_token: string;
  refresh_token: string;
  access_token_expire_in: number;
  seller_name?: string;
  open_id?: string;
}> {
  const url = new URL(`${AUTH_BASE}/api/v2/token/get`);
  url.searchParams.set('app_key', appKey());
  url.searchParams.set('app_secret', appSecret());
  url.searchParams.set('auth_code', code);
  url.searchParams.set('grant_type', 'authorized_code');
  const res = await fetch(url.toString(), { method: 'GET' });
  const text = await res.text();
  if (!res.ok)
    throw new TikTokApiError(`Token exchange failed (${res.status}): ${text.slice(0, 200)}`);
  const body = JSON.parse(text);
  if (body.code && body.code !== 0)
    throw new TikTokApiError(body.message ?? 'Token exchange failed', body.code);
  return body.data ?? body;
}

async function refreshAccessToken(creds: TikTokShopCredentials): Promise<TikTokShopCredentials> {
  const url = new URL(`${AUTH_BASE}/api/v2/token/refresh`);
  url.searchParams.set('app_key', appKey());
  url.searchParams.set('app_secret', appSecret());
  url.searchParams.set('refresh_token', creds.refreshToken);
  url.searchParams.set('grant_type', 'refresh_token');
  const res = await fetch(url.toString(), { method: 'GET' });
  const text = await res.text();
  if (!res.ok) throw new TikTokApiError(`Token refresh failed (${res.status})`, res.status);
  const body = JSON.parse(text);
  const data = body.data ?? body;
  return {
    ...creds,
    accessToken: data.access_token,
    refreshToken: data.refresh_token ?? creds.refreshToken,
    expiresAt: Date.now() + (data.access_token_expire_in ?? 3600) * 1000,
  };
}

interface AuthorizedShop {
  cipher: string;
  id: string;
  name?: string;
  region?: string;
}

async function getAuthorizedShop(accessToken: string): Promise<AuthorizedShop> {
  const timestamp = Math.floor(Date.now() / 1000);
  const path = '/authorization/202309/shops';
  const params: Record<string, string | number> = {
    app_key: appKey(),
    timestamp,
    version: '202309',
  };
  const sign = signRequest(path, params);
  const url = new URL(`${API_BASE}${path}`);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, String(v));
  url.searchParams.set('sign', sign);
  const res = await fetch(url.toString(), {
    method: 'GET',
    headers: { 'x-tts-access-token': accessToken },
  });
  const text = await res.text();
  const body = JSON.parse(text);
  const shops = body.data?.shops as AuthorizedShop[] | undefined;
  if (!shops || shops.length === 0) {
    throw new TikTokApiError('No authorized shops returned. Re-run consent and select a shop.');
  }
  return shops[0]!;
}

export async function beginTikTokShopOAuth(): Promise<TikTokShopCredentials> {
  if (!appKey() || !appSecret()) {
    throw new TikTokApiError(
      'TikTok Shop not configured. Set TIKTOK_SHOP_APP_KEY / TIKTOK_SHOP_APP_SECRET.',
    );
  }

  const flow = await beginOAuth({
    service: 'tiktok-shop',
    scopes: [],
    pkce: false,
    buildAuthUrl: ({ redirectUri, state }) => {
      const params = new URLSearchParams({
        app_key: appKey(),
        state,
        redirect_uri: redirectUri,
      });
      return `${AUTH_BASE}/oauth/authorize?${params.toString()}`;
    },
  });

  const callback = await flow.callback;
  const tokens = await exchangeCode(callback.code);
  const shop = await getAuthorizedShop(tokens.access_token);
  return {
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
    expiresAt: Date.now() + (tokens.access_token_expire_in ?? 3600) * 1000,
    shopCipher: shop.cipher,
    shopId: shop.id,
    shopName: shop.name,
    region: (shop.region as TikTokShopCredentials['region']) ?? 'GLOBAL',
  };
}

// ------ High-level operations -------------------------------------------

export interface TikTokProductSummary {
  id: string;
  title: string;
  status: string;
  price?: string;
  image?: string;
}

export async function listProducts(creds: TikTokShopCredentials): Promise<TikTokProductSummary[]> {
  const { response } = await signedFetch(creds, {
    method: 'POST',
    path: '/product/202309/products/search',
    query: { page_size: 50 },
    body: {},
  });
  const data = await readJson<{
    products?: Array<{
      id?: string;
      title?: string;
      status?: string;
      main_images?: Array<{ urls?: string[] }>;
    }>;
  }>(response);
  return (data.products ?? []).map((p) => ({
    id: p.id ?? '',
    title: p.title ?? '',
    status: p.status ?? 'UNKNOWN',
    image: p.main_images?.[0]?.urls?.[0],
  }));
}

export interface TikTokOrderSummary {
  id: string;
  status: string;
  total?: string;
  createdAt: string;
}

export async function listOrders(creds: TikTokShopCredentials): Promise<TikTokOrderSummary[]> {
  const { response } = await signedFetch(creds, {
    method: 'POST',
    path: '/order/202309/orders/search',
    query: { page_size: 50 },
    body: {},
  });
  const data = await readJson<{
    orders?: Array<{
      id?: string;
      status?: string;
      total_amount?: { value?: string };
      create_time?: number;
    }>;
  }>(response);
  return (data.orders ?? []).map((o) => ({
    id: o.id ?? '',
    status: o.status ?? 'UNKNOWN',
    total: o.total_amount?.value,
    createdAt: o.create_time ? new Date(o.create_time * 1000).toISOString() : '',
  }));
}

export { getTikTokShopCredentials };
