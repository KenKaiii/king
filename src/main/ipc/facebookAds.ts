import log from 'electron-log/main';
import {
  getFacebookCredentials,
  setFacebookCredentials,
  resolveAdAccountId,
} from '../services/facebookCredentials';
import {
  validateToken,
  listAdAccounts,
  listPages,
  listCampaigns,
  listAdSets,
  createAdEndToEnd,
  exchangeForLongLivedToken,
  beginFacebookOAuth,
  FacebookApiError,
  type EndToEndInput,
  type FbObjective,
  type FbCtaType,
} from '../services/facebookAdsClient';
import { secureHandle } from './validateSender';

/**
 * Wrap a handler so FB API errors come back to the renderer as a clean
 * `{ message, code, fbtraceId }` shape that the wizard can display verbatim.
 * Anything else is rethrown so the IPC bridge can serialise it normally.
 */
function wrap<A extends unknown[], R>(fn: (...args: A) => Promise<R>): (...args: A) => Promise<R> {
  return async (...args: A) => {
    try {
      return await fn(...args);
    } catch (err) {
      if (err instanceof FacebookApiError) {
        log.warn('[fb] api error', err.message, { code: err.code, fbtraceId: err.fbtraceId });
        const e = new Error(err.message) as Error & {
          code?: number | string;
          fbtraceId?: string;
        };
        e.code = err.code;
        e.fbtraceId = err.fbtraceId;
        throw e;
      }
      throw err;
    }
  };
}

function requireCreds() {
  const creds = getFacebookCredentials();
  if (!creds) throw new Error('Facebook is not connected. Save an access token in API Keys.');
  return creds;
}

export interface CreateAdRequest {
  /** Optional override; falls back to saved default. */
  adAccountId?: string;
  pageId?: string;
  /** Reuse vs create. */
  campaignId?: string;
  newCampaign?: { name: string; objective: FbObjective };
  adSetId?: string;
  newAdSet?: {
    name: string;
    dailyBudget: number;
    countries: string[];
    ageMin: number;
    ageMax: number;
  };
  // Creative + ad metadata.
  ad: {
    name: string;
    headline: string;
    message: string;
    link: string;
    ctaType: FbCtaType;
    status: 'ACTIVE' | 'PAUSED';
  };
  image: { filename: string; bytes: ArrayBuffer | Uint8Array };
}

export function registerFacebookAdsHandlers(): void {
  secureHandle(
    'facebookAds:status',
    wrap(async () => {
      const creds = getFacebookCredentials();
      return {
        connected: !!creds,
        defaultAdAccountId: creds?.defaultAdAccountId,
        defaultPageId: creds?.defaultPageId,
        expiresAt: creds?.expiresAt,
      };
    }),
  );

  secureHandle(
    'facebookAds:saveCredentials',
    wrap(
      async (
        _event,
        input: { accessToken: string; defaultAdAccountId?: string; defaultPageId?: string },
      ) => {
        const inputToken = input.accessToken?.trim();
        if (!inputToken) throw new Error('Access token is required');

        // If FACEBOOK_APP_ID/_SECRET are configured, swap the short-lived token
        // for a 60-day long-lived one before persisting. Falls back to the
        // input token unchanged if no app is configured.
        const exchanged = await exchangeForLongLivedToken(inputToken);
        const accessToken = exchanged.accessToken;

        // Validate up front so the user gets immediate feedback on bad scopes.
        const result = await validateToken({ accessToken });

        // Auto-pick first account / page if user left those blank.
        const defaultAdAccountId =
          input.defaultAdAccountId?.trim() || result.adAccounts[0]?.id || undefined;
        const defaultPageId = input.defaultPageId?.trim() || result.pages[0]?.id || undefined;

        await setFacebookCredentials({
          accessToken,
          defaultAdAccountId,
          defaultPageId,
          expiresAt: exchanged.expiresAt,
        });
        return {
          adAccountCount: result.adAccounts.length,
          pageCount: result.pages.length,
          defaultAdAccountId,
          defaultPageId,
        };
      },
    ),
  );

  secureHandle(
    'facebookAds:beginOAuth',
    wrap(async () => {
      const { accessToken: shortLived } = await beginFacebookOAuth();
      const exchanged = await exchangeForLongLivedToken(shortLived);
      const accessToken = exchanged.accessToken;
      const result = await validateToken({ accessToken });
      const defaultAdAccountId = result.adAccounts[0]?.id;
      const defaultPageId = result.pages[0]?.id;
      await setFacebookCredentials({
        accessToken,
        defaultAdAccountId,
        defaultPageId,
        expiresAt: exchanged.expiresAt,
      });
      return {
        adAccountCount: result.adAccounts.length,
        pageCount: result.pages.length,
        defaultAdAccountId,
        defaultPageId,
      };
    }),
  );

  secureHandle(
    'facebookAds:listAdAccounts',
    wrap(async () => listAdAccounts(requireCreds())),
  );

  secureHandle(
    'facebookAds:listPages',
    wrap(async () => listPages(requireCreds())),
  );

  secureHandle(
    'facebookAds:listCampaigns',
    wrap(async (_event, adAccountId?: string) => {
      const creds = requireCreds();
      const id = resolveAdAccountId(creds, adAccountId);
      return listCampaigns(creds, id);
    }),
  );

  secureHandle(
    'facebookAds:listAdSets',
    wrap(async (_event, adAccountId?: string, campaignId?: string) => {
      const creds = requireCreds();
      const id = resolveAdAccountId(creds, adAccountId);
      return listAdSets(creds, id, campaignId);
    }),
  );

  secureHandle(
    'facebookAds:createAd',
    wrap(async (_event, request: CreateAdRequest) => {
      const creds = requireCreds();
      const adAccountId = resolveAdAccountId(creds, request.adAccountId);
      const pageId = request.pageId?.trim() || creds.defaultPageId;
      if (!pageId) throw new Error('No page selected. Pass pageId or save a default.');

      const buffer = Buffer.from(request.image.bytes as ArrayBuffer);

      const e2e: EndToEndInput = {
        ...(request.campaignId
          ? { campaignId: request.campaignId }
          : request.newCampaign
            ? {
                campaign: {
                  name: request.newCampaign.name,
                  objective: request.newCampaign.objective,
                  specialAdCategories: [],
                },
              }
            : {}),
        ...(request.adSetId
          ? { adSetId: request.adSetId }
          : request.newAdSet
            ? {
                adSet: {
                  name: request.newAdSet.name,
                  dailyBudget: request.newAdSet.dailyBudget,
                  targeting: {
                    countries: request.newAdSet.countries,
                    ageMin: request.newAdSet.ageMin,
                    ageMax: request.newAdSet.ageMax,
                  },
                },
              }
            : {}),
        pageId,
        image: { bytes: buffer, filename: request.image.filename },
        creative: {
          name: request.ad.name,
          message: request.ad.message,
          headline: request.ad.headline,
          link: request.ad.link,
          ctaType: request.ad.ctaType,
        },
        ad: { name: request.ad.name, status: request.ad.status },
      };

      const result = await createAdEndToEnd(creds, adAccountId, e2e);
      return { ...result, adAccountId };
    }),
  );
}
