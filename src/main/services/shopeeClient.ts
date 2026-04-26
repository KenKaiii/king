import { createHmac } from 'node:crypto';
import { beginOAuth } from './oauthBroker';
import { withFreshToken } from './tokenRefresh';
import {
  getShopeeCredentials,
  setShopeeCredentials,
  type ShopeeCredentials,
} from './shopeeCredentials';

/**
 * Shopee Open Platform client.
 *
 * Auth (https://open.shopee.com/documents):
 *   - OAuth-style consent → access_token (4h) + refresh_token (30d)
 *   - Every call signed: HMAC-SHA256(`partner_id` + `api_path` + `timestamp` +
 *     `access_token` + `shop_id`) keyed with `partner_key`.
 *
 * Hosts:
 *   - Live: partner.shopeemobile.com
 *   - Sandbox: partner.test-stable.shopeemobile.com
 *
 * One-time developer registration (env at runtime):
 *   SHOPEE_PARTNER_ID
 *   SHOPEE_PARTNER_KEY
 *   SHOPEE_HOST (optional, defaults to live)
 */

function partnerId(): string {
  return process.env.SHOPEE_PARTNER_ID ?? '';
}
function partnerKey(): string {
  return process.env.SHOPEE_PARTNER_KEY ?? '';
}
function host(): string {
  return process.env.SHOPEE_HOST ?? 'https://partner.shopeemobile.com';
}

export class ShopeeApiError extends Error {
  code?: number | string;
  constructor(message: string, code?: number | string) {
    super(message);
    this.name = 'ShopeeApiError';
    this.code = code;
  }
}

// ------ Signing ----------------------------------------------------------

function signPath(path: string, accessToken: string, shopId: number, timestamp: number): string {
  // For shop APIs the base string is partner_id + path + timestamp + access_token + shop_id.
  const baseString = `${partnerId()}${path}${timestamp}${accessToken}${shopId}`;
  return createHmac('sha256', partnerKey()).update(baseString).digest('hex');
}

function signPublicPath(path: string, timestamp: number): string {
  // Auth-flow paths sign without access_token / shop_id.
  const baseString = `${partnerId()}${path}${timestamp}`;
  return createHmac('sha256', partnerKey()).update(baseString).digest('hex');
}

interface ShopApiInput {
  method: 'GET' | 'POST';
  path: string;
  query?: Record<string, string | number | undefined>;
  body?: unknown;
}

async function shopApi<T>(creds: ShopeeCredentials, input: ShopApiInput): Promise<T> {
  const { response } = await withFreshToken<ShopeeCredentials>({
    lockKey: 'shopee',
    current: creds,
    refresh: refreshAccessToken,
    save: setShopeeCredentials,
    call: (token) => {
      const timestamp = Math.floor(Date.now() / 1000);
      const sign = signPath(input.path, token, creds.shopId, timestamp);
      const url = new URL(`${host()}${input.path}`);
      url.searchParams.set('partner_id', partnerId());
      url.searchParams.set('timestamp', String(timestamp));
      url.searchParams.set('access_token', token);
      url.searchParams.set('shop_id', String(creds.shopId));
      url.searchParams.set('sign', sign);
      for (const [k, v] of Object.entries(input.query ?? {})) {
        if (v !== undefined) url.searchParams.set(k, String(v));
      }
      return fetch(url.toString(), {
        method: input.method,
        headers: input.body ? { 'Content-Type': 'application/json' } : {},
        body: input.body !== undefined ? JSON.stringify(input.body) : undefined,
      });
    },
  });
  const text = await response.text();
  let body: { error?: string; message?: string; response?: T };
  try {
    body = JSON.parse(text);
  } catch {
    throw new ShopeeApiError(`Non-JSON response (${response.status})`, response.status);
  }
  if (body.error && body.error !== '') {
    throw new ShopeeApiError(body.message ?? body.error, body.error);
  }
  return (body.response ?? (body as unknown as T)) as T;
}

// ------ OAuth ------------------------------------------------------------

async function exchangeCode(
  code: string,
  shopId: number,
): Promise<{
  access_token: string;
  refresh_token: string;
  expire_in: number;
}> {
  const path = '/api/v2/auth/token/get';
  const timestamp = Math.floor(Date.now() / 1000);
  const sign = signPublicPath(path, timestamp);
  const url = new URL(`${host()}${path}`);
  url.searchParams.set('partner_id', partnerId());
  url.searchParams.set('timestamp', String(timestamp));
  url.searchParams.set('sign', sign);
  const res = await fetch(url.toString(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, shop_id: shopId, partner_id: Number(partnerId()) }),
  });
  const text = await res.text();
  if (!res.ok)
    throw new ShopeeApiError(`Token exchange failed (${res.status}): ${text.slice(0, 200)}`);
  const body = JSON.parse(text);
  if (body.error) throw new ShopeeApiError(body.message ?? body.error, body.error);
  return body;
}

async function refreshAccessToken(creds: ShopeeCredentials): Promise<ShopeeCredentials> {
  const path = '/api/v2/auth/access_token/get';
  const timestamp = Math.floor(Date.now() / 1000);
  const sign = signPublicPath(path, timestamp);
  const url = new URL(`${host()}${path}`);
  url.searchParams.set('partner_id', partnerId());
  url.searchParams.set('timestamp', String(timestamp));
  url.searchParams.set('sign', sign);
  const res = await fetch(url.toString(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      refresh_token: creds.refreshToken,
      partner_id: Number(partnerId()),
      shop_id: creds.shopId,
    }),
  });
  const text = await res.text();
  if (!res.ok) throw new ShopeeApiError(`Token refresh failed (${res.status})`, res.status);
  const body = JSON.parse(text);
  if (body.error) throw new ShopeeApiError(body.message ?? body.error, body.error);
  return {
    ...creds,
    accessToken: body.access_token,
    refreshToken: body.refresh_token ?? creds.refreshToken,
    expiresAt: Date.now() + (body.expire_in ?? 14400) * 1000,
  };
}

export async function beginShopeeOAuth(): Promise<ShopeeCredentials> {
  if (!partnerId() || !partnerKey()) {
    throw new ShopeeApiError('Shopee not configured. Set SHOPEE_PARTNER_ID / SHOPEE_PARTNER_KEY.');
  }

  const flow = await beginOAuth({
    service: 'shopee',
    scopes: [],
    pkce: false,
    buildAuthUrl: ({ redirectUri, state }) => {
      const path = '/api/v2/shop/auth_partner';
      const timestamp = Math.floor(Date.now() / 1000);
      const sign = signPublicPath(path, timestamp);
      const params = new URLSearchParams({
        partner_id: partnerId(),
        timestamp: String(timestamp),
        sign,
        redirect: redirectUri,
        state,
      });
      return `${host()}${path}?${params.toString()}`;
    },
  });

  const callback = await flow.callback;
  const shopIdRaw = callback.extra.shop_id;
  if (!shopIdRaw) {
    throw new ShopeeApiError(
      'Shopee redirect did not include shop_id. Re-run consent and select a shop.',
    );
  }
  const shopId = Number(shopIdRaw);
  if (!Number.isFinite(shopId)) {
    throw new ShopeeApiError(`Shopee redirect returned invalid shop_id: ${shopIdRaw}`);
  }
  const tokens = await exchangeCode(callback.code, shopId);
  return {
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
    expiresAt: Date.now() + (tokens.expire_in ?? 14400) * 1000,
    shopId,
    region: undefined,
  };
}

// ------ High-level operations -------------------------------------------

export interface ShopeeProductSummary {
  id: number;
  name: string;
  price?: number;
  stock?: number;
  image?: string;
}

export async function listProducts(creds: ShopeeCredentials): Promise<ShopeeProductSummary[]> {
  const list = await shopApi<{ item?: Array<{ item_id: number }> }>(creds, {
    method: 'GET',
    path: '/api/v2/product/get_item_list',
    query: { offset: 0, page_size: 50, item_status: 'NORMAL' },
  });
  const ids = (list.item ?? []).map((i) => i.item_id);
  if (ids.length === 0) return [];
  const detail = await shopApi<{
    item_list?: Array<{
      item_id: number;
      item_name: string;
      image?: { image_url_list?: string[] };
      price_info?: Array<{ current_price?: number }>;
      stock_info_v2?: { summary_info?: { total_available_stock?: number } };
    }>;
  }>(creds, {
    method: 'GET',
    path: '/api/v2/product/get_item_base_info',
    query: { item_id_list: ids.join(',') },
  });
  return (detail.item_list ?? []).map((i) => ({
    id: i.item_id,
    name: i.item_name,
    price: i.price_info?.[0]?.current_price,
    stock: i.stock_info_v2?.summary_info?.total_available_stock,
    image: i.image?.image_url_list?.[0],
  }));
}

export interface ShopeeOrderSummary {
  id: string;
  status: string;
  total?: string;
  createdAt: string;
}

export async function listOrders(creds: ShopeeCredentials): Promise<ShopeeOrderSummary[]> {
  const now = Math.floor(Date.now() / 1000);
  const fifteenDaysAgo = now - 15 * 24 * 60 * 60;
  const list = await shopApi<{ order_list?: Array<{ order_sn: string }> }>(creds, {
    method: 'GET',
    path: '/api/v2/order/get_order_list',
    query: {
      time_range_field: 'create_time',
      time_from: fifteenDaysAgo,
      time_to: now,
      page_size: 50,
    },
  });
  const sns = (list.order_list ?? []).map((o) => o.order_sn);
  if (sns.length === 0) return [];
  const detail = await shopApi<{
    order_list?: Array<{
      order_sn: string;
      order_status: string;
      total_amount?: number;
      create_time?: number;
    }>;
  }>(creds, {
    method: 'GET',
    path: '/api/v2/order/get_order_detail',
    query: {
      order_sn_list: sns.join(','),
      response_optional_fields: 'order_status,total_amount,create_time',
    },
  });
  return (detail.order_list ?? []).map((o) => ({
    id: o.order_sn,
    status: o.order_status,
    total: typeof o.total_amount === 'number' ? String(o.total_amount) : undefined,
    createdAt: o.create_time ? new Date(o.create_time * 1000).toISOString() : '',
  }));
}

export { getShopeeCredentials };
