import log from 'electron-log/main';
import { beginOAuth } from './oauthBroker';
import { withFreshToken } from './tokenRefresh';
import {
  getGoogleAdsCredentials,
  setGoogleAdsCredentials,
  type GoogleAdsCredentials,
} from './googleAdsCredentials';

/**
 * Google Ads API client.
 *
 * Auth model (https://developers.google.com/google-ads/api/rest/auth):
 *   - OAuth 2.0 desktop / native app flow → refresh_token
 *   - Every API call requires:
 *       Authorization: Bearer <access_token>
 *       developer-token: <DEVELOPER_TOKEN>
 *       login-customer-id: <MCC_ID>   ← only when the operating user is a manager
 *
 * One-time developer registration (you, the human, do this; constants below
 * read the values from env at runtime so dev builds work without rebuild):
 *   GOOGLE_OAUTH_CLIENT_ID      — from Google Cloud Console (Desktop App)
 *   GOOGLE_OAUTH_CLIENT_SECRET  — same. NOT actually secret in a desktop binary,
 *                                  ships with the build. PKCE makes its absence
 *                                  on the auth request acceptable, but Google
 *                                  still requires it on the token-exchange step.
 *   GOOGLE_ADS_DEVELOPER_TOKEN  — from Google Ads API Center under your MCC.
 *
 * Endpoint version `v23` — bump quarterly per https://developers.google.com/google-ads/api/docs/release-notes.
 */

const API_VERSION = 'v23';
const API_BASE = `https://googleads.googleapis.com/${API_VERSION}`;
const OAUTH_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const OAUTH_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const SCOPES = ['https://www.googleapis.com/auth/adwords'];

function clientId(): string {
  return process.env.GOOGLE_OAUTH_CLIENT_ID ?? '';
}
function clientSecret(): string {
  return process.env.GOOGLE_OAUTH_CLIENT_SECRET ?? '';
}
function developerToken(): string {
  return process.env.GOOGLE_ADS_DEVELOPER_TOKEN ?? '';
}

export class GoogleAdsApiError extends Error {
  code?: number | string;
  details?: unknown;
  constructor(message: string, opts: { code?: number | string; details?: unknown } = {}) {
    super(message);
    this.name = 'GoogleAdsApiError';
    this.code = opts.code;
    this.details = opts.details;
  }
}

// ------ OAuth flow -------------------------------------------------------

async function exchangeCode(
  code: string,
  redirectUri: string,
  codeVerifier: string,
): Promise<{ access_token: string; refresh_token: string; expires_in: number; scope: string }> {
  const body = new URLSearchParams({
    code,
    client_id: clientId(),
    client_secret: clientSecret(),
    redirect_uri: redirectUri,
    grant_type: 'authorization_code',
    code_verifier: codeVerifier,
  });
  const res = await fetch(OAUTH_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  const text = await res.text();
  if (!res.ok) {
    throw new GoogleAdsApiError(`Token exchange failed (${res.status}): ${text.slice(0, 200)}`);
  }
  return JSON.parse(text);
}

async function refreshAccessToken(creds: GoogleAdsCredentials): Promise<GoogleAdsCredentials> {
  const body = new URLSearchParams({
    refresh_token: creds.refreshToken,
    client_id: clientId(),
    client_secret: clientSecret(),
    grant_type: 'refresh_token',
  });
  const res = await fetch(OAUTH_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  const text = await res.text();
  if (!res.ok) {
    throw new GoogleAdsApiError(`Token refresh failed (${res.status}): ${text.slice(0, 200)}`);
  }
  const data = JSON.parse(text) as { access_token: string; expires_in: number };
  return {
    ...creds,
    accessToken: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };
}

export async function beginGoogleAdsOAuth(): Promise<GoogleAdsCredentials> {
  if (!clientId() || !clientSecret()) {
    throw new GoogleAdsApiError(
      'Google OAuth not configured. Set GOOGLE_OAUTH_CLIENT_ID / GOOGLE_OAUTH_CLIENT_SECRET.',
    );
  }
  if (!developerToken()) {
    throw new GoogleAdsApiError(
      'Google Ads developer token not configured. Set GOOGLE_ADS_DEVELOPER_TOKEN.',
    );
  }

  const flow = await beginOAuth({
    service: 'google-ads',
    scopes: SCOPES,
    pkce: true,
    buildAuthUrl: ({ redirectUri, state, codeChallenge, scopes }) => {
      const params = new URLSearchParams({
        client_id: clientId(),
        redirect_uri: redirectUri,
        response_type: 'code',
        scope: scopes.join(' '),
        access_type: 'offline',
        include_granted_scopes: 'true',
        prompt: 'consent', // force refresh_token issuance even on re-auth
        state,
        code_challenge: codeChallenge ?? '',
        code_challenge_method: 'S256',
      });
      return `${OAUTH_AUTH_URL}?${params.toString()}`;
    },
  });

  const callback = await flow.callback;
  const tokens = await exchangeCode(callback.code, flow.redirectUri, flow.codeVerifier!);
  if (!tokens.refresh_token) {
    throw new GoogleAdsApiError(
      'Google did not return a refresh token. Try revoking access and reconnecting.',
    );
  }

  return {
    refreshToken: tokens.refresh_token,
    accessToken: tokens.access_token,
    expiresAt: Date.now() + tokens.expires_in * 1000,
    scopes: SCOPES,
  };
}

// ------ Authorised request helper ---------------------------------------

async function adsRequest(
  creds: GoogleAdsCredentials,
  customerId: string | undefined,
  method: 'GET' | 'POST',
  path: string,
  body?: unknown,
): Promise<{ response: Response; creds: GoogleAdsCredentials }> {
  return withFreshToken<GoogleAdsCredentials>({
    lockKey: 'google-ads',
    current: creds,
    refresh: refreshAccessToken,
    save: setGoogleAdsCredentials,
    call: (token) => {
      const headers: Record<string, string> = {
        Authorization: `Bearer ${token}`,
        'developer-token': developerToken(),
        'Content-Type': 'application/json',
      };
      if (creds.loginCustomerId)
        headers['login-customer-id'] = creds.loginCustomerId.replace(/-/g, '');
      void customerId; // currently the path encodes it; reserved for future header use
      return fetch(`${API_BASE}${path}`, {
        method,
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
      });
    },
  });
}

async function readJson<T>(response: Response): Promise<T> {
  const text = await response.text();
  let body: unknown;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    throw new GoogleAdsApiError(`Non-JSON response (${response.status}): ${text.slice(0, 200)}`);
  }
  if (!response.ok) {
    const errEnv = body as {
      error?: { code?: number; message?: string; status?: string; details?: unknown };
    };
    throw new GoogleAdsApiError(errEnv?.error?.message || `HTTP ${response.status}`, {
      code: errEnv?.error?.code ?? response.status,
      details: errEnv?.error?.details,
    });
  }
  return body as T;
}

// ------ High-level operations -------------------------------------------

export async function listAccessibleCustomers(creds: GoogleAdsCredentials): Promise<string[]> {
  const { response } = await adsRequest(
    creds,
    undefined,
    'GET',
    '/customers:listAccessibleCustomers',
  );
  const body = await readJson<{ resourceNames?: string[] }>(response);
  // resourceName is `customers/1234567890`.
  return (body.resourceNames ?? []).map((rn) => rn.split('/')[1] ?? '').filter(Boolean);
}

export interface CampaignRow {
  id: string;
  name: string;
  status: string;
  type: string;
  dailyBudget: number;
  spent: number;
  ctr: number;
  cpc: number;
  conversions: number;
  convRate: number;
  cpa: number;
  impressionShare: number;
  budgetResourceName?: string;
}

interface SearchStreamResp {
  results?: Array<{
    campaign?: { id?: string; name?: string; status?: string; advertisingChannelType?: string };
    campaignBudget?: { amountMicros?: string; resourceName?: string };
    metrics?: {
      costMicros?: string;
      ctr?: number;
      averageCpc?: string;
      conversions?: number;
      conversionsFromInteractionsRate?: number;
      costPerConversion?: string;
      searchImpressionShare?: number;
    };
  }>;
}

const CAMPAIGN_GAQL = `
SELECT
  campaign.id,
  campaign.name,
  campaign.status,
  campaign.advertising_channel_type,
  campaign_budget.resource_name,
  campaign_budget.amount_micros,
  metrics.cost_micros,
  metrics.ctr,
  metrics.average_cpc,
  metrics.conversions,
  metrics.conversions_from_interactions_rate,
  metrics.cost_per_conversion,
  metrics.search_impression_share
FROM campaign
WHERE segments.date DURING TODAY
ORDER BY metrics.cost_micros DESC
LIMIT 200
`;

function microsToMajor(micros: string | undefined): number {
  if (!micros) return 0;
  return Number(micros) / 1_000_000;
}

export async function searchCampaigns(
  creds: GoogleAdsCredentials,
  customerId: string,
): Promise<CampaignRow[]> {
  const { response } = await adsRequest(
    creds,
    customerId,
    'POST',
    `/customers/${customerId}/googleAds:searchStream`,
    { query: CAMPAIGN_GAQL },
  );
  // searchStream returns an array of payloads (one per chunk).
  const text = await response.text();
  if (!response.ok) {
    throw new GoogleAdsApiError(`searchStream failed (${response.status}): ${text.slice(0, 200)}`);
  }
  let chunks: SearchStreamResp[] = [];
  try {
    const parsed = JSON.parse(text);
    chunks = Array.isArray(parsed) ? parsed : [parsed];
  } catch {
    throw new GoogleAdsApiError('searchStream returned invalid JSON');
  }
  const out: CampaignRow[] = [];
  for (const chunk of chunks) {
    for (const r of chunk.results ?? []) {
      out.push({
        id: r.campaign?.id ?? '',
        name: r.campaign?.name ?? '',
        status: r.campaign?.status ?? 'UNKNOWN',
        type: r.campaign?.advertisingChannelType ?? 'UNKNOWN',
        dailyBudget: microsToMajor(r.campaignBudget?.amountMicros),
        spent: microsToMajor(r.metrics?.costMicros),
        ctr: (r.metrics?.ctr ?? 0) * 100,
        cpc: microsToMajor(r.metrics?.averageCpc),
        conversions: r.metrics?.conversions ?? 0,
        convRate: (r.metrics?.conversionsFromInteractionsRate ?? 0) * 100,
        cpa: microsToMajor(r.metrics?.costPerConversion),
        impressionShare: (r.metrics?.searchImpressionShare ?? 0) * 100,
        budgetResourceName: r.campaignBudget?.resourceName,
      });
    }
  }
  return out;
}

async function mutateCampaignStatus(
  creds: GoogleAdsCredentials,
  customerId: string,
  campaignId: string,
  status: 'ENABLED' | 'PAUSED',
): Promise<void> {
  const { response } = await adsRequest(
    creds,
    customerId,
    'POST',
    `/customers/${customerId}/campaigns:mutate`,
    {
      operations: [
        {
          updateMask: 'status',
          update: {
            resourceName: `customers/${customerId}/campaigns/${campaignId}`,
            status,
          },
        },
      ],
    },
  );
  await readJson<unknown>(response);
}

export async function pauseCampaign(
  creds: GoogleAdsCredentials,
  customerId: string,
  campaignId: string,
): Promise<void> {
  await mutateCampaignStatus(creds, customerId, campaignId, 'PAUSED');
}

export async function resumeCampaign(
  creds: GoogleAdsCredentials,
  customerId: string,
  campaignId: string,
): Promise<void> {
  await mutateCampaignStatus(creds, customerId, campaignId, 'ENABLED');
}

export async function updateBudget(
  creds: GoogleAdsCredentials,
  customerId: string,
  budgetId: string,
  amountMicros: number,
): Promise<void> {
  const { response } = await adsRequest(
    creds,
    customerId,
    'POST',
    `/customers/${customerId}/campaignBudgets:mutate`,
    {
      operations: [
        {
          updateMask: 'amount_micros',
          update: {
            resourceName: `customers/${customerId}/campaignBudgets/${budgetId}`,
            amountMicros: String(Math.round(amountMicros)),
          },
        },
      ],
    },
  );
  await readJson<unknown>(response);
}

// ------ Audience insights -----------------------------------------------

export interface AudienceInsightSection {
  title: string;
  metric: string;
  segments: Array<{ label: string; value: string; share: number }>;
}

export async function audienceInsights(
  creds: GoogleAdsCredentials,
  customerId: string,
): Promise<AudienceInsightSection[]> {
  // Three GAQL queries in parallel — country, age, device. Network breakdown
  // requires `segments.ad_network_type` against `campaign` — keep narrow for v1.
  const queries: Array<{
    title: string;
    metric: string;
    gaql: string;
    labelOf: (r: unknown) => string;
  }> = [
    {
      title: 'Country',
      metric: 'conversions',
      gaql: `SELECT geographic_view.country_criterion_id, metrics.conversions FROM geographic_view WHERE segments.date DURING LAST_30_DAYS LIMIT 10`,
      labelOf: (r) =>
        String(
          (r as { geographicView?: { countryCriterionId?: string } }).geographicView
            ?.countryCriterionId ?? '—',
        ),
    },
    {
      title: 'Age Group',
      metric: 'CPA',
      gaql: `SELECT ad_group_criterion.age_range.type, metrics.cost_per_conversion, metrics.conversions FROM age_range_view WHERE segments.date DURING LAST_30_DAYS LIMIT 10`,
      labelOf: (r) =>
        String(
          (r as { adGroupCriterion?: { ageRange?: { type?: string } } }).adGroupCriterion?.ageRange
            ?.type ?? '—',
        ),
    },
    {
      title: 'Device',
      metric: 'conversions',
      gaql: `SELECT segments.device, metrics.conversions FROM customer WHERE segments.date DURING LAST_30_DAYS`,
      labelOf: (r) => String((r as { segments?: { device?: string } }).segments?.device ?? '—'),
    },
  ];

  const out: AudienceInsightSection[] = [];
  for (const q of queries) {
    try {
      const { response } = await adsRequest(
        creds,
        customerId,
        'POST',
        `/customers/${customerId}/googleAds:searchStream`,
        { query: q.gaql },
      );
      const text = await response.text();
      if (!response.ok) {
        log.warn('[google-ads] audience insight failed', q.title, response.status);
        continue;
      }
      const parsed = JSON.parse(text) as SearchStreamResp[] | SearchStreamResp;
      const rows = (Array.isArray(parsed) ? parsed : [parsed]).flatMap((c) => c.results ?? []);
      const segments = rows.slice(0, 8).map((r) => {
        const conv = (r as { metrics?: { conversions?: number } }).metrics?.conversions ?? 0;
        return { label: q.labelOf(r), value: String(conv.toFixed(1)), share: 0 };
      });
      const total = segments.reduce((s, x) => s + Number(x.value), 0) || 1;
      for (const s of segments) {
        s.share = Math.round((Number(s.value) / total) * 100);
      }
      out.push({ title: q.title, metric: q.metric, segments });
    } catch (err) {
      log.warn('[google-ads] insights error', err);
    }
  }
  return out;
}

// Re-export for IPC layer convenience.
export { getGoogleAdsCredentials };
