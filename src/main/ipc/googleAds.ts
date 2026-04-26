import log from 'electron-log/main';
import { secureHandle } from './validateSender';
import {
  getGoogleAdsCredentials,
  setGoogleAdsCredentials,
  clearGoogleAdsCredentials,
} from '../services/googleAdsCredentials';
import {
  beginGoogleAdsOAuth,
  listAccessibleCustomers,
  searchCampaigns,
  pauseCampaign,
  resumeCampaign,
  updateBudget,
  audienceInsights,
  GoogleAdsApiError,
} from '../services/googleAdsClient';

function wrap<A extends unknown[], R>(fn: (...args: A) => Promise<R>): (...args: A) => Promise<R> {
  return async (...args: A) => {
    try {
      return await fn(...args);
    } catch (err) {
      if (err instanceof GoogleAdsApiError) {
        log.warn('[google-ads] api error', err.message);
        const e = new Error(err.message) as Error & { code?: number | string };
        e.code = err.code;
        throw e;
      }
      throw err;
    }
  };
}

function requireCreds() {
  const creds = getGoogleAdsCredentials();
  if (!creds) throw new Error('Google Ads is not connected. Connect in API Keys.');
  return creds;
}

function resolveCustomerId(explicit: string | undefined): string {
  const creds = requireCreds();
  const id = explicit?.trim() || creds.defaultCustomerId || creds.customerIds?.[0];
  if (!id) throw new Error('No Google Ads customer selected.');
  return id;
}

export function registerGoogleAdsHandlers(): void {
  secureHandle(
    'googleAds:status',
    wrap(async () => {
      const creds = getGoogleAdsCredentials();
      if (!creds) return { connected: false };
      return {
        connected: true,
        loginCustomerId: creds.loginCustomerId,
        defaultCustomerId: creds.defaultCustomerId,
        customerIds: creds.customerIds,
      };
    }),
  );

  secureHandle(
    'googleAds:beginOAuth',
    wrap(async () => {
      const fresh = await beginGoogleAdsOAuth();
      // Hydrate the customer list from the freshly authorised account.
      const customers = await listAccessibleCustomers(fresh);
      const next = {
        ...fresh,
        customerIds: customers,
        defaultCustomerId: fresh.defaultCustomerId ?? customers[0],
      };
      await setGoogleAdsCredentials(next);
      return { customerIds: customers };
    }),
  );

  secureHandle(
    'googleAds:disconnect',
    wrap(async () => {
      await clearGoogleAdsCredentials();
      return { success: true };
    }),
  );

  secureHandle(
    'googleAds:listCampaigns',
    wrap(async (_event, customerId?: string) => {
      const creds = requireCreds();
      return searchCampaigns(creds, resolveCustomerId(customerId));
    }),
  );

  secureHandle(
    'googleAds:pauseCampaign',
    wrap(async (_event, campaignId: string, customerId?: string) => {
      await pauseCampaign(requireCreds(), resolveCustomerId(customerId), campaignId);
      return { success: true };
    }),
  );

  secureHandle(
    'googleAds:resumeCampaign',
    wrap(async (_event, campaignId: string, customerId?: string) => {
      await resumeCampaign(requireCreds(), resolveCustomerId(customerId), campaignId);
      return { success: true };
    }),
  );

  secureHandle(
    'googleAds:updateBudget',
    wrap(async (_event, budgetId: string, amountMicros: number, customerId?: string) => {
      await updateBudget(requireCreds(), resolveCustomerId(customerId), budgetId, amountMicros);
      return { success: true };
    }),
  );

  secureHandle(
    'googleAds:listAudienceInsights',
    wrap(async (_event, customerId?: string) => {
      return audienceInsights(requireCreds(), resolveCustomerId(customerId));
    }),
  );
}
