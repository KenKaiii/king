import { jsonCodec, loadCredentials, saveCredentials, clearCredentials } from './credentialStore';

export type AmazonRegion = 'na' | 'eu' | 'fe';

export interface AmazonSpApiCredentials {
  /** From the LWA authorization-code exchange. */
  refreshToken: string;
  /** Cached short-lived (1h) access token. */
  accessToken: string;
  /** Epoch ms for `accessToken`. */
  expiresAt: number;
  sellingPartnerId?: string;
  marketplaceIds: string[];
  region: AmazonRegion;
}

const SERVICE = 'amazon';

const codec = jsonCodec<AmazonSpApiCredentials>((parsed) => {
  if (!parsed || typeof parsed !== 'object') return null;
  const o = parsed as Record<string, unknown>;
  if (typeof o.refreshToken !== 'string' || !o.refreshToken) return null;
  return {
    refreshToken: o.refreshToken,
    accessToken: typeof o.accessToken === 'string' ? o.accessToken : '',
    expiresAt: typeof o.expiresAt === 'number' ? o.expiresAt : 0,
    sellingPartnerId: typeof o.sellingPartnerId === 'string' ? o.sellingPartnerId : undefined,
    marketplaceIds: Array.isArray(o.marketplaceIds)
      ? (o.marketplaceIds.filter((x) => typeof x === 'string') as string[])
      : [],
    region: (typeof o.region === 'string' ? o.region : 'na') as AmazonRegion,
  };
});

export function getAmazonCredentials(): AmazonSpApiCredentials | null {
  return loadCredentials(SERVICE, codec);
}

export async function setAmazonCredentials(creds: AmazonSpApiCredentials): Promise<void> {
  await saveCredentials(SERVICE, codec, creds);
}

export async function clearAmazonCredentials(): Promise<void> {
  await clearCredentials(SERVICE);
}
