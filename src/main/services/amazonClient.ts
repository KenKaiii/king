import { beginOAuth } from './oauthBroker';
import { withFreshToken } from './tokenRefresh';
import {
  getAmazonCredentials,
  setAmazonCredentials,
  type AmazonRegion,
  type AmazonSpApiCredentials,
} from './amazonCredentials';

/**
 * Amazon Selling Partner API (SP-API) client.
 *
 * Auth (https://developer-docs.amazon.com/sp-api/docs/connecting-to-the-selling-partner-api):
 *   - LWA-only since 2023-10-02. AWS Signature v4 / IAM role assumption are
 *     no longer required (see
 *     https://developer-docs.amazon.com/sp-api/changelog/sp-api-will-no-longer-require-aws-iam-or-aws-signature-version-4).
 *   - Flow: LWA OAuth on `https://sellercentral.amazon.com/apps/authorize/consent`
 *     → refresh_token → exchange for 1h access_token → call SP-API with
 *     `x-amz-access-token: <token>`.
 *
 * Endpoint host depends on the seller's region:
 *   - na → sellingpartnerapi-na.amazon.com
 *   - eu → sellingpartnerapi-eu.amazon.com
 *   - fe → sellingpartnerapi-fe.amazon.com
 *
 * One-time developer registration (env at runtime):
 *   AMAZON_LWA_CLIENT_ID
 *   AMAZON_LWA_CLIENT_SECRET
 *   AMAZON_SP_APP_ID  — your Solution Provider Application ID; goes in the
 *                       consent URL as `application_id`.
 */

const REGION_HOSTS: Record<AmazonRegion, string> = {
  na: 'https://sellingpartnerapi-na.amazon.com',
  eu: 'https://sellingpartnerapi-eu.amazon.com',
  fe: 'https://sellingpartnerapi-fe.amazon.com',
};

function lwaClientId(): string {
  return process.env.AMAZON_LWA_CLIENT_ID ?? '';
}
function lwaClientSecret(): string {
  return process.env.AMAZON_LWA_CLIENT_SECRET ?? '';
}
function appId(): string {
  return process.env.AMAZON_SP_APP_ID ?? '';
}

const LWA_TOKEN_URL = 'https://api.amazon.com/auth/o2/token';
const SELLER_CENTRAL_BY_REGION: Record<AmazonRegion, string> = {
  na: 'https://sellercentral.amazon.com',
  eu: 'https://sellercentral-europe.amazon.com',
  fe: 'https://sellercentral.amazon.co.jp',
};

export class AmazonApiError extends Error {
  code?: number | string;
  details?: unknown;
  constructor(message: string, opts: { code?: number | string; details?: unknown } = {}) {
    super(message);
    this.name = 'AmazonApiError';
    this.code = opts.code;
    this.details = opts.details;
  }
}

// ------ LWA ---------------------------------------------------------------

async function exchangeAuthCode(code: string): Promise<{
  refresh_token: string;
  access_token: string;
  expires_in: number;
}> {
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    client_id: lwaClientId(),
    client_secret: lwaClientSecret(),
  });
  const res = await fetch(LWA_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  const text = await res.text();
  if (!res.ok) {
    throw new AmazonApiError(`LWA exchange failed (${res.status}): ${text.slice(0, 200)}`);
  }
  return JSON.parse(text);
}

async function refreshAccessToken(creds: AmazonSpApiCredentials): Promise<AmazonSpApiCredentials> {
  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: creds.refreshToken,
    client_id: lwaClientId(),
    client_secret: lwaClientSecret(),
  });
  const res = await fetch(LWA_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  const text = await res.text();
  if (!res.ok) {
    throw new AmazonApiError(`LWA refresh failed (${res.status}): ${text.slice(0, 200)}`);
  }
  const data = JSON.parse(text) as { access_token: string; expires_in: number };
  return {
    ...creds,
    accessToken: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };
}

export async function beginAmazonOAuth(
  region: AmazonRegion = 'na',
): Promise<AmazonSpApiCredentials> {
  if (!lwaClientId() || !lwaClientSecret()) {
    throw new AmazonApiError(
      'Amazon LWA not configured. Set AMAZON_LWA_CLIENT_ID / AMAZON_LWA_CLIENT_SECRET.',
    );
  }
  if (!appId()) {
    throw new AmazonApiError('Amazon SP App ID not configured. Set AMAZON_SP_APP_ID.');
  }

  const flow = await beginOAuth({
    service: 'amazon',
    scopes: [],
    pkce: false,
    buildAuthUrl: ({ redirectUri, state }) => {
      const params = new URLSearchParams({
        application_id: appId(),
        state,
        redirect_uri: redirectUri,
        version: 'beta', // remove for production-published apps
      });
      return `${SELLER_CENTRAL_BY_REGION[region]}/apps/authorize/consent?${params.toString()}`;
    },
  });

  const callback = await flow.callback;
  // Amazon redirects with `spapi_oauth_code`, `selling_partner_id`, `mws_auth_token`(legacy).
  const lwaCode = callback.extra.spapi_oauth_code ?? callback.code;
  const sellingPartnerId = callback.extra.selling_partner_id;
  if (!lwaCode) throw new AmazonApiError('No spapi_oauth_code in redirect.');

  const tokens = await exchangeAuthCode(lwaCode);
  return {
    refreshToken: tokens.refresh_token,
    accessToken: tokens.access_token,
    expiresAt: Date.now() + tokens.expires_in * 1000,
    sellingPartnerId,
    marketplaceIds: [],
    region,
  };
}

// ------ Authorised request ----------------------------------------------

async function spApi(
  creds: AmazonSpApiCredentials,
  method: 'GET' | 'POST',
  path: string,
  query?: Record<string, string | number | undefined>,
): Promise<Response> {
  const { response } = await withFreshToken<AmazonSpApiCredentials>({
    lockKey: 'amazon-sp-api',
    current: creds,
    refresh: refreshAccessToken,
    save: setAmazonCredentials,
    call: (token) => {
      const url = new URL(`${REGION_HOSTS[creds.region]}${path}`);
      for (const [k, v] of Object.entries(query ?? {})) {
        if (v !== undefined) url.searchParams.set(k, String(v));
      }
      return fetch(url.toString(), {
        method,
        headers: {
          'x-amz-access-token': token,
          Accept: 'application/json',
          'User-Agent': 'King/1.0 (Language=Node.js)',
        },
      });
    },
  });
  return response;
}

async function readJson<T>(response: Response): Promise<T> {
  const text = await response.text();
  let body: unknown;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    throw new AmazonApiError(`Non-JSON response (${response.status})`, { code: response.status });
  }
  if (!response.ok) {
    const errs = (body as { errors?: Array<{ code?: string; message?: string }> })?.errors;
    const first = errs?.[0];
    throw new AmazonApiError(first?.message ?? `HTTP ${response.status}`, {
      code: first?.code ?? response.status,
      details: body,
    });
  }
  return body as T;
}

// ------ High-level operations -------------------------------------------

export interface AmazonOrderRow {
  id: string;
  status: string;
  total?: string;
  purchasedAt: string;
}

export async function listOrders(creds: AmazonSpApiCredentials): Promise<AmazonOrderRow[]> {
  if (creds.marketplaceIds.length === 0) {
    throw new AmazonApiError(
      'No marketplace selected. Set marketplaceIds before calling listOrders.',
    );
  }
  // Last 30 days.
  const created = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const res = await spApi(creds, 'GET', '/orders/v0/orders', {
    MarketplaceIds: creds.marketplaceIds.join(','),
    CreatedAfter: created,
    MaxResultsPerPage: 50,
  });
  const body = await readJson<{
    payload?: {
      Orders?: Array<{
        AmazonOrderId: string;
        OrderStatus: string;
        OrderTotal?: { Amount?: string; CurrencyCode?: string };
        PurchaseDate: string;
      }>;
    };
  }>(res);
  return (body.payload?.Orders ?? []).map((o) => ({
    id: o.AmazonOrderId,
    status: o.OrderStatus,
    total: o.OrderTotal
      ? `${o.OrderTotal.Amount} ${o.OrderTotal.CurrencyCode ?? ''}`.trim()
      : undefined,
    purchasedAt: o.PurchaseDate,
  }));
}

export interface AmazonCatalogItem {
  asin: string;
  title?: string;
  brand?: string;
}

export async function listCatalogItems(
  creds: AmazonSpApiCredentials,
): Promise<AmazonCatalogItem[]> {
  if (creds.marketplaceIds.length === 0) return [];
  // Catalog Items v2022-04-01 — search by seller's listings is paged via /listings/2021-08-01/items.
  // The simplest "what does this seller have" surface is `getListingsItem` per SKU; for v1
  // we expose top-level catalog search which lets the user browse public catalog.
  const res = await spApi(creds, 'GET', '/catalog/2022-04-01/items', {
    marketplaceIds: creds.marketplaceIds.join(','),
    pageSize: 20,
  });
  const body = await readJson<{
    items?: Array<{
      asin: string;
      summaries?: Array<{ itemName?: string; brand?: string }>;
    }>;
  }>(res);
  return (body.items ?? []).map((i) => ({
    asin: i.asin,
    title: i.summaries?.[0]?.itemName,
    brand: i.summaries?.[0]?.brand,
  }));
}

export { getAmazonCredentials };
