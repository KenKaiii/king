import { jsonCodec, loadCredentials, saveCredentials, clearCredentials } from './credentialStore';

export type TikTokRegion = 'US' | 'GB' | 'ID' | 'TH' | 'VN' | 'PH' | 'MY' | 'SG' | 'GLOBAL';

export interface TikTokShopCredentials {
  accessToken: string;
  refreshToken: string;
  /** Epoch ms. */
  expiresAt: number;
  shopCipher: string;
  shopId: string;
  shopName?: string;
  region: TikTokRegion;
}

const SERVICE = 'tiktok';

const codec = jsonCodec<TikTokShopCredentials>((parsed) => {
  if (!parsed || typeof parsed !== 'object') return null;
  const o = parsed as Record<string, unknown>;
  if (typeof o.accessToken !== 'string') return null;
  if (typeof o.refreshToken !== 'string') return null;
  if (typeof o.shopCipher !== 'string') return null;
  if (typeof o.shopId !== 'string') return null;
  return {
    accessToken: o.accessToken,
    refreshToken: o.refreshToken,
    expiresAt: typeof o.expiresAt === 'number' ? o.expiresAt : 0,
    shopCipher: o.shopCipher,
    shopId: o.shopId,
    shopName: typeof o.shopName === 'string' ? o.shopName : undefined,
    region: typeof o.region === 'string' ? (o.region as TikTokRegion) : 'GLOBAL',
  };
});

export function getTikTokShopCredentials(): TikTokShopCredentials | null {
  return loadCredentials(SERVICE, codec);
}

export async function setTikTokShopCredentials(creds: TikTokShopCredentials): Promise<void> {
  await saveCredentials(SERVICE, codec, creds);
}

export async function clearTikTokShopCredentials(): Promise<void> {
  await clearCredentials(SERVICE);
}
