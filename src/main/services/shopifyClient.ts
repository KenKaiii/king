import type { ShopifyCredentials } from './shopifyCredentials';

/**
 * Thin Shopify Admin API client.
 *
 * - Auth: per-store Custom App access token in `X-Shopify-Access-Token`.
 * - REST endpoint: `https://{shopDomain}/admin/api/{version}/<resource>.json`.
 * - GraphQL endpoint: `https://{shopDomain}/admin/api/{version}/graphql.json`.
 *
 * Version is pinned to a recent stable. Shopify supports each version for ~12
 * months — bump quarterly and verify against
 * https://shopify.dev/docs/api/usage/versioning before release.
 */

// Latest stable per https://shopify.dev/docs/api/admin-rest/usage/versioning
// Shopify ships quarterly (2026-01 → 2026-04 → 2026-07 → ...). Each version
// is supported ≥ 12 months. Verify against the developer changelog before
// bumping; new endpoints occasionally appear in newer versions only.
export const SHOPIFY_API_VERSION = '2026-04';

export class ShopifyApiError extends Error {
  status?: number;
  shopifyErrors?: unknown;
  constructor(message: string, opts: { status?: number; shopifyErrors?: unknown } = {}) {
    super(message);
    this.name = 'ShopifyApiError';
    this.status = opts.status;
    this.shopifyErrors = opts.shopifyErrors;
  }
}

function adminBase(creds: ShopifyCredentials): string {
  return `https://${creds.shopDomain}/admin/api/${SHOPIFY_API_VERSION}`;
}

async function rest<T>(
  creds: ShopifyCredentials,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  path: string,
  query: Record<string, string | number | undefined> = {},
): Promise<T> {
  const url = new URL(`${adminBase(creds)}${path}`);
  for (const [k, v] of Object.entries(query)) {
    if (v !== undefined) url.searchParams.set(k, String(v));
  }
  const res = await fetch(url.toString(), {
    method,
    headers: {
      'X-Shopify-Access-Token': creds.accessToken,
      Accept: 'application/json',
    },
  });
  const text = await res.text();
  if (!res.ok) {
    let body: unknown;
    try {
      body = text ? JSON.parse(text) : null;
    } catch {
      /* ignore */
    }
    const errs = (body as { errors?: unknown })?.errors;
    throw new ShopifyApiError(
      typeof errs === 'string' ? errs : `Shopify ${method} ${path} → HTTP ${res.status}`,
      { status: res.status, shopifyErrors: errs },
    );
  }
  return text ? (JSON.parse(text) as T) : (null as T);
}

interface ShopRest {
  shop: { id: number; name: string; currency: string; email: string; domain: string };
}

export async function getShop(creds: ShopifyCredentials): Promise<{
  name: string;
  currency: string;
  email: string;
  domain: string;
}> {
  const r = await rest<ShopRest>(creds, 'GET', '/shop.json');
  return r.shop;
}

export interface ShopifyProductSummary {
  id: string;
  title: string;
  status: string;
  vendor?: string;
  image?: string;
}

interface ProductsRest {
  products: Array<{
    id: number;
    title: string;
    status: string;
    vendor?: string;
    image?: { src?: string } | null;
  }>;
}

export async function listProducts(
  creds: ShopifyCredentials,
  limit = 50,
): Promise<ShopifyProductSummary[]> {
  const r = await rest<ProductsRest>(creds, 'GET', '/products.json', {
    limit,
    fields: 'id,title,status,vendor,image',
  });
  return r.products.map((p) => ({
    id: String(p.id),
    title: p.title,
    status: p.status,
    vendor: p.vendor,
    image: p.image?.src ?? undefined,
  }));
}

export interface ShopifyOrderSummary {
  id: string;
  name: string;
  total: string;
  currency: string;
  createdAt: string;
}

interface OrdersRest {
  orders: Array<{
    id: number;
    name: string;
    total_price: string;
    currency: string;
    created_at: string;
  }>;
}

export async function listOrders(
  creds: ShopifyCredentials,
  limit = 50,
): Promise<ShopifyOrderSummary[]> {
  const r = await rest<OrdersRest>(creds, 'GET', '/orders.json', {
    limit,
    status: 'any',
    fields: 'id,name,total_price,currency,created_at',
  });
  return r.orders.map((o) => ({
    id: String(o.id),
    name: o.name,
    total: o.total_price,
    currency: o.currency,
    createdAt: o.created_at,
  }));
}
