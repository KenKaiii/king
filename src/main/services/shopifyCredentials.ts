import { jsonCodec, loadCredentials, saveCredentials, clearCredentials } from './credentialStore';

export interface ShopifyCredentials {
  /** e.g. `mystore.myshopify.com`. We accept either bare or with protocol on input but persist bare. */
  shopDomain: string;
  /** Admin API access token (`shpat_…` for Custom Apps). */
  accessToken: string;
  /** Cached shop metadata from validation. */
  shopName?: string;
  currency?: string;
}

const SERVICE = 'shopify';

const codec = jsonCodec<ShopifyCredentials>((parsed) => {
  if (!parsed || typeof parsed !== 'object') return null;
  const o = parsed as Record<string, unknown>;
  if (typeof o.shopDomain !== 'string' || !o.shopDomain) return null;
  if (typeof o.accessToken !== 'string' || !o.accessToken) return null;
  return {
    shopDomain: o.shopDomain,
    accessToken: o.accessToken,
    shopName: typeof o.shopName === 'string' ? o.shopName : undefined,
    currency: typeof o.currency === 'string' ? o.currency : undefined,
  };
});

export function getShopifyCredentials(): ShopifyCredentials | null {
  return loadCredentials(SERVICE, codec);
}

export async function setShopifyCredentials(creds: ShopifyCredentials): Promise<void> {
  await saveCredentials(SERVICE, codec, creds);
}

export async function clearShopifyCredentials(): Promise<void> {
  await clearCredentials(SERVICE);
}

/** Normalise user-pasted domain → `mystore.myshopify.com`. */
export function normaliseShopDomain(input: string): string {
  let d = input.trim().toLowerCase();
  d = d.replace(/^https?:\/\//, '');
  d = d.replace(/\/.*$/, '');
  return d;
}
