import { jsonCodec, loadCredentials, saveCredentials, clearCredentials } from './credentialStore';

export interface ShopeeCredentials {
  accessToken: string;
  refreshToken: string;
  /** Epoch ms. */
  expiresAt: number;
  shopId: number;
  /** Region/host suffix, e.g. `partner.shopeemobile.com` (live). */
  region?: string;
}

const SERVICE = 'shopee';

const codec = jsonCodec<ShopeeCredentials>((parsed) => {
  if (!parsed || typeof parsed !== 'object') return null;
  const o = parsed as Record<string, unknown>;
  if (typeof o.accessToken !== 'string') return null;
  if (typeof o.refreshToken !== 'string') return null;
  if (typeof o.shopId !== 'number') return null;
  return {
    accessToken: o.accessToken,
    refreshToken: o.refreshToken,
    expiresAt: typeof o.expiresAt === 'number' ? o.expiresAt : 0,
    shopId: o.shopId,
    region: typeof o.region === 'string' ? o.region : undefined,
  };
});

export function getShopeeCredentials(): ShopeeCredentials | null {
  return loadCredentials(SERVICE, codec);
}

export async function setShopeeCredentials(creds: ShopeeCredentials): Promise<void> {
  await saveCredentials(SERVICE, codec, creds);
}

export async function clearShopeeCredentials(): Promise<void> {
  await clearCredentials(SERVICE);
}
