import { jsonCodec, loadCredentials, saveCredentials, clearCredentials } from './credentialStore';

export interface GoogleAdsCredentials {
  refreshToken: string;
  accessToken: string;
  /** Epoch ms. */
  expiresAt: number;
  /** Manager-account (MCC) id, if the user is operating one. Strips dashes. */
  loginCustomerId?: string;
  /** Default 10-digit customer id used by `searchCampaigns` etc. */
  defaultCustomerId?: string;
  /** All customer ids accessible to the authorised user (cached from `listAccessibleCustomers`). */
  customerIds?: string[];
  scopes: string[];
}

const SERVICE = 'google-ads';

const codec = jsonCodec<GoogleAdsCredentials>((parsed) => {
  if (!parsed || typeof parsed !== 'object') return null;
  const o = parsed as Record<string, unknown>;
  if (typeof o.refreshToken !== 'string' || !o.refreshToken) return null;
  return {
    refreshToken: o.refreshToken,
    accessToken: typeof o.accessToken === 'string' ? o.accessToken : '',
    expiresAt: typeof o.expiresAt === 'number' ? o.expiresAt : 0,
    loginCustomerId: typeof o.loginCustomerId === 'string' ? o.loginCustomerId : undefined,
    defaultCustomerId: typeof o.defaultCustomerId === 'string' ? o.defaultCustomerId : undefined,
    customerIds: Array.isArray(o.customerIds)
      ? (o.customerIds.filter((x) => typeof x === 'string') as string[])
      : undefined,
    scopes: Array.isArray(o.scopes)
      ? (o.scopes.filter((x) => typeof x === 'string') as string[])
      : [],
  };
});

export function getGoogleAdsCredentials(): GoogleAdsCredentials | null {
  return loadCredentials(SERVICE, codec);
}

export async function setGoogleAdsCredentials(creds: GoogleAdsCredentials): Promise<void> {
  await saveCredentials(SERVICE, codec, creds);
}

export async function clearGoogleAdsCredentials(): Promise<void> {
  await clearCredentials(SERVICE);
}
