import log from 'electron-log/main';
import type { FacebookCredentials } from './facebookCredentials';
import { beginOAuth } from './oauthBroker';

/**
 * Thin typed wrappers around the Meta Marketing API (Graph API v23.0).
 *
 * Every account-scoped function takes `adAccountId` as an explicit argument.
 * Multi-account is intrinsic: callers (IPC handlers, HTTP routes) resolve
 * the id from request → saved default → error. We do NOT close over a
 * default here so the same process can serve concurrent calls against
 * different ad accounts without races.
 */

// Bumped from v23.0 → v25.0. Field shapes (`ads_insights`, `ad_image`,
// `object_story_spec`, `adcreatives`, `campaigns`) are unchanged across the
// v23 → v25 range per the Marketing API changelogs. Verify against
// https://developers.facebook.com/docs/graph-api/changelog before bumping.
const GRAPH_VERSION = 'v25.0';
const GRAPH_BASE = `https://graph.facebook.com/${GRAPH_VERSION}`;

// ------ Public types -----------------------------------------------------

export interface FbBusinessRef {
  id: string;
  name: string;
}

export interface FbAdAccount {
  id: string; // act_xxxxx
  name: string;
  currency: string;
  /** Numeric status from FB. 1 = ACTIVE, see Marketing API docs. */
  account_status: number;
  business?: FbBusinessRef;
}

export interface FbPage {
  id: string;
  name: string;
}

export interface FbCampaign {
  id: string;
  name: string;
  objective: string;
  status: string;
}

export interface FbAdSet {
  id: string;
  name: string;
  campaign_id: string;
  daily_budget?: string;
  status: string;
}

export type FbObjective =
  | 'OUTCOME_TRAFFIC'
  | 'OUTCOME_AWARENESS'
  | 'OUTCOME_SALES'
  | 'OUTCOME_ENGAGEMENT'
  | 'OUTCOME_LEADS'
  | 'OUTCOME_APP_PROMOTION';

export type FbCtaType =
  | 'SHOP_NOW'
  | 'LEARN_MORE'
  | 'SIGN_UP'
  | 'DOWNLOAD'
  | 'GET_OFFER'
  | 'BOOK_TRAVEL'
  | 'CONTACT_US';

export interface FbTargeting {
  countries: string[];
  ageMin: number;
  ageMax: number;
}

export interface CreateCampaignInput {
  name: string;
  objective: FbObjective;
  specialAdCategories?: string[];
}

export interface CreateAdSetInput {
  campaignId: string;
  name: string;
  /** Major-unit currency value (e.g. dollars). Converted to minor units below. */
  dailyBudget: number;
  optimizationGoal?: string;
  billingEvent?: string;
  targeting: FbTargeting;
}

export interface UploadAdImageInput {
  bytes: Buffer;
  filename: string;
}

export interface CreateAdCreativeInput {
  name: string;
  pageId: string;
  imageHash: string;
  message: string;
  headline: string;
  link: string;
  ctaType: FbCtaType;
}

export interface CreateAdInput {
  name: string;
  adSetId: string;
  creativeId: string;
  status?: 'ACTIVE' | 'PAUSED';
}

/** Convenience input for `createAdEndToEnd`. */
export interface EndToEndInput {
  /** Reuse existing campaign by id, or pass a `campaign` block to create one. */
  campaignId?: string;
  campaign?: CreateCampaignInput;
  /** Reuse existing ad set by id, or pass an `adSet` block to create one. */
  adSetId?: string;
  adSet?: Omit<CreateAdSetInput, 'campaignId'>;
  pageId: string;
  image: UploadAdImageInput;
  creative: Omit<CreateAdCreativeInput, 'imageHash' | 'pageId'>;
  ad: Omit<CreateAdInput, 'adSetId' | 'creativeId'>;
}

export interface EndToEndResult {
  campaignId: string;
  adSetId: string;
  creativeId: string;
  adId: string;
  imageHash: string;
}

// ------ Errors -----------------------------------------------------------

export class FacebookApiError extends Error {
  code: number | string;
  fbtraceId?: string;
  type?: string;

  constructor(
    message: string,
    opts: { code?: number | string; fbtraceId?: string; type?: string } = {},
  ) {
    super(message);
    this.name = 'FacebookApiError';
    this.code = opts.code ?? 'unknown';
    this.fbtraceId = opts.fbtraceId;
    this.type = opts.type;
  }
}

interface FbErrorEnvelope {
  error?: {
    message?: string;
    type?: string;
    code?: number;
    fbtrace_id?: string;
    error_user_msg?: string;
  };
}

async function parseJsonOrThrow<T>(res: Response): Promise<T> {
  const text = await res.text();
  let body: unknown;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    throw new FacebookApiError(
      `Facebook API returned non-JSON (${res.status}): ${text.slice(0, 200)}`,
      { code: res.status },
    );
  }
  if (!res.ok) {
    const env = (body ?? {}) as FbErrorEnvelope;
    const err = env.error ?? {};
    throw new FacebookApiError(err.error_user_msg || err.message || `HTTP ${res.status}`, {
      code: err.code ?? res.status,
      fbtraceId: err.fbtrace_id,
      type: err.type,
    });
  }
  return body as T;
}

async function graphGet<T>(
  creds: FacebookCredentials,
  path: string,
  params: Record<string, string | number | undefined> = {},
): Promise<T> {
  const url = new URL(`${GRAPH_BASE}${path}`);
  url.searchParams.set('access_token', creds.accessToken);
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined) url.searchParams.set(k, String(v));
  }
  const res = await fetch(url.toString(), { method: 'GET' });
  return parseJsonOrThrow<T>(res);
}

async function graphPost<T>(
  creds: FacebookCredentials,
  path: string,
  fields: Record<string, string | number | boolean>,
): Promise<T> {
  const body = new URLSearchParams();
  body.set('access_token', creds.accessToken);
  for (const [k, v] of Object.entries(fields)) {
    body.set(k, String(v));
  }
  const res = await fetch(`${GRAPH_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  return parseJsonOrThrow<T>(res);
}

// ------ Pagination -------------------------------------------------------

interface FbPage_<T> {
  data: T[];
  paging?: { next?: string };
}

async function paginateAll<T>(
  creds: FacebookCredentials,
  path: string,
  params: Record<string, string | number>,
): Promise<T[]> {
  const out: T[] = [];
  const url = new URL(`${GRAPH_BASE}${path}`);
  url.searchParams.set('access_token', creds.accessToken);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, String(v));

  let next: string | undefined = url.toString();
  // Cap at 20 pages to avoid runaway loops on an unexpectedly huge account.
  for (let i = 0; i < 20 && next; i++) {
    const res = await fetch(next, { method: 'GET' });
    const page = await parseJsonOrThrow<FbPage_<T>>(res);
    out.push(...page.data);
    next = page.paging?.next;
  }
  return out;
}

// ------ OAuth flow ------------------------------------------------------

/**
 * Browser-based OAuth flow using the loopback broker. Requires a registered
 * Meta app with `http://127.0.0.1/*` whitelisted on Login Settings.
 *
 * Returns the short-lived user token; caller should immediately exchange it
 * via `exchangeForLongLivedToken` for the 60-day token before persisting.
 */
export async function beginFacebookOAuth(): Promise<{ accessToken: string }> {
  const appId = process.env.FACEBOOK_APP_ID;
  const appSecret = process.env.FACEBOOK_APP_SECRET;
  if (!appId || !appSecret) {
    throw new FacebookApiError(
      'Facebook OAuth not configured. Set FACEBOOK_APP_ID / FACEBOOK_APP_SECRET, or paste a token from Graph API Explorer.',
    );
  }

  const flow = await beginOAuth({
    service: 'facebook',
    scopes: ['ads_management', 'pages_show_list', 'pages_read_engagement', 'business_management'],
    pkce: false,
    buildAuthUrl: ({ redirectUri, state, scopes }) => {
      const params = new URLSearchParams({
        client_id: appId,
        redirect_uri: redirectUri,
        state,
        scope: scopes.join(','),
        response_type: 'code',
      });
      return `https://www.facebook.com/${GRAPH_VERSION}/dialog/oauth?${params.toString()}`;
    },
  });

  const cb = await flow.callback;
  // Exchange the auth code for a (short-lived) user access token.
  const exchangeUrl = new URL(`${GRAPH_BASE}/oauth/access_token`);
  exchangeUrl.searchParams.set('client_id', appId);
  exchangeUrl.searchParams.set('client_secret', appSecret);
  exchangeUrl.searchParams.set('redirect_uri', flow.redirectUri);
  exchangeUrl.searchParams.set('code', cb.code);
  const res = await fetch(exchangeUrl.toString(), { method: 'GET' });
  const body = await parseJsonOrThrow<{ access_token: string }>(res);
  return { accessToken: body.access_token };
}

// ------ Long-lived token exchange ---------------------------------------

/**
 * Exchange a short-lived (1–2h) user access token for a long-lived (60d) one.
 * https://developers.facebook.com/docs/facebook-login/guides/access-tokens/get-long-lived
 *
 * Requires a registered Meta app. App id / secret are env-driven so dev builds
 * can ship without a rebuild; absent values cause this function to no-op and
 * return the original token (we keep validation working on a Graph Explorer
 * paste-in flow).
 */
export async function exchangeForLongLivedToken(
  shortLivedToken: string,
): Promise<{ accessToken: string; expiresAt?: number }> {
  const appId = process.env.FACEBOOK_APP_ID;
  const appSecret = process.env.FACEBOOK_APP_SECRET;
  if (!appId || !appSecret) {
    return { accessToken: shortLivedToken };
  }
  const url = new URL(`${GRAPH_BASE}/oauth/access_token`);
  url.searchParams.set('grant_type', 'fb_exchange_token');
  url.searchParams.set('client_id', appId);
  url.searchParams.set('client_secret', appSecret);
  url.searchParams.set('fb_exchange_token', shortLivedToken);
  const res = await fetch(url.toString(), { method: 'GET' });
  const body = await parseJsonOrThrow<{ access_token: string; expires_in?: number }>(res);
  return {
    accessToken: body.access_token,
    expiresAt:
      typeof body.expires_in === 'number' ? Date.now() + body.expires_in * 1000 : undefined,
  };
}

// ------ Account-level lookups -------------------------------------------

export async function listAdAccounts(creds: FacebookCredentials): Promise<FbAdAccount[]> {
  return paginateAll<FbAdAccount>(creds, '/me/adaccounts', {
    fields: 'name,currency,account_status,business{id,name}',
    limit: 200,
  });
}

export async function listPages(creds: FacebookCredentials): Promise<FbPage[]> {
  return paginateAll<FbPage>(creds, '/me/accounts', { fields: 'id,name', limit: 200 });
}

export async function validateToken(
  creds: FacebookCredentials,
): Promise<{ adAccounts: FbAdAccount[]; pages: FbPage[] }> {
  const [adAccounts, pages] = await Promise.all([listAdAccounts(creds), listPages(creds)]);
  return { adAccounts, pages };
}

// ------ Account-scoped lookups ------------------------------------------

export async function listCampaigns(
  creds: FacebookCredentials,
  adAccountId: string,
): Promise<FbCampaign[]> {
  return paginateAll<FbCampaign>(creds, `/${adAccountId}/campaigns`, {
    fields: 'id,name,objective,status',
    limit: 200,
  });
}

export async function listAdSets(
  creds: FacebookCredentials,
  adAccountId: string,
  campaignId?: string,
): Promise<FbAdSet[]> {
  const params: Record<string, string | number> = {
    fields: 'id,name,campaign_id,daily_budget,status',
    limit: 200,
  };
  if (campaignId) {
    // Use filtering instead of /campaign/{id}/adsets so we share the same code path.
    params.filtering = JSON.stringify([
      { field: 'campaign.id', operator: 'EQUAL', value: campaignId },
    ]);
  }
  return paginateAll<FbAdSet>(creds, `/${adAccountId}/adsets`, params);
}

// ------ Mutations --------------------------------------------------------

export async function createCampaign(
  creds: FacebookCredentials,
  adAccountId: string,
  input: CreateCampaignInput,
): Promise<{ id: string }> {
  return graphPost<{ id: string }>(creds, `/${adAccountId}/campaigns`, {
    name: input.name,
    objective: input.objective,
    status: 'PAUSED',
    special_ad_categories: JSON.stringify(input.specialAdCategories ?? []),
  });
}

/**
 * Map a campaign objective to a sensible default optimization goal /
 * billing event for the ad set. Users can override later — we just need a
 * non-error default for v1.
 */
function defaultOptimizationGoal(objective?: FbObjective): string {
  switch (objective) {
    case 'OUTCOME_AWARENESS':
      return 'REACH';
    case 'OUTCOME_SALES':
      return 'OFFSITE_CONVERSIONS';
    case 'OUTCOME_ENGAGEMENT':
      return 'POST_ENGAGEMENT';
    case 'OUTCOME_LEADS':
      return 'LEAD_GENERATION';
    case 'OUTCOME_TRAFFIC':
    default:
      return 'LINK_CLICKS';
  }
}

export async function createAdSet(
  creds: FacebookCredentials,
  adAccountId: string,
  input: CreateAdSetInput,
  objectiveHint?: FbObjective,
): Promise<{ id: string }> {
  const targeting = {
    geo_locations: { countries: input.targeting.countries },
    age_min: input.targeting.ageMin,
    age_max: input.targeting.ageMax,
  };
  return graphPost<{ id: string }>(creds, `/${adAccountId}/adsets`, {
    name: input.name,
    campaign_id: input.campaignId,
    daily_budget: Math.round(input.dailyBudget * 100), // major → minor units
    billing_event: input.billingEvent ?? 'IMPRESSIONS',
    optimization_goal: input.optimizationGoal ?? defaultOptimizationGoal(objectiveHint),
    bid_strategy: 'LOWEST_COST_WITHOUT_CAP',
    targeting: JSON.stringify(targeting),
    status: 'PAUSED',
  });
}

export async function uploadAdImage(
  creds: FacebookCredentials,
  adAccountId: string,
  input: UploadAdImageInput,
): Promise<string> {
  // multipart/form-data — `bytes` field carries the binary directly per
  // https://developers.facebook.com/docs/marketing-api/reference/ad-image/.
  const form = new FormData();
  form.set('access_token', creds.accessToken);
  // Web's Blob requires Uint8Array for some Node 22 shims — coerce explicitly.
  const blob = new Blob([new Uint8Array(input.bytes)]);
  form.set('source', blob, input.filename);
  const res = await fetch(`${GRAPH_BASE}/${adAccountId}/adimages`, {
    method: 'POST',
    body: form,
  });
  // Response shape: { images: { <filename>: { hash, url } } }
  const body = await parseJsonOrThrow<{
    images?: Record<string, { hash: string; url?: string }>;
  }>(res);
  const first = body.images ? Object.values(body.images)[0] : undefined;
  if (!first?.hash) {
    throw new FacebookApiError('Image upload returned no hash');
  }
  return first.hash;
}

export async function createAdCreative(
  creds: FacebookCredentials,
  adAccountId: string,
  input: CreateAdCreativeInput,
): Promise<{ id: string }> {
  const objectStorySpec = {
    page_id: input.pageId,
    link_data: {
      image_hash: input.imageHash,
      message: input.message,
      link: input.link,
      name: input.headline,
      call_to_action: { type: input.ctaType, value: { link: input.link } },
    },
  };
  return graphPost<{ id: string }>(creds, `/${adAccountId}/adcreatives`, {
    name: input.name,
    object_story_spec: JSON.stringify(objectStorySpec),
  });
}

export async function createAd(
  creds: FacebookCredentials,
  adAccountId: string,
  input: CreateAdInput,
): Promise<{ id: string }> {
  return graphPost<{ id: string }>(creds, `/${adAccountId}/ads`, {
    name: input.name,
    adset_id: input.adSetId,
    creative: JSON.stringify({ creative_id: input.creativeId }),
    status: input.status ?? 'PAUSED',
  });
}

/**
 * End-to-end flow used by both the wizard and the agent HTTP API. Skips
 * campaign / ad-set creation when the caller passes an existing id. Returns
 * every id created along the way so callers can deep-link into Ads Manager.
 */
export async function createAdEndToEnd(
  creds: FacebookCredentials,
  adAccountId: string,
  input: EndToEndInput,
): Promise<EndToEndResult> {
  log.info('[fb] createAdEndToEnd', { adAccountId });

  // 1. Campaign — reuse or create.
  let campaignId = input.campaignId;
  let objectiveHint: FbObjective | undefined;
  if (!campaignId) {
    if (!input.campaign) {
      throw new FacebookApiError('Either campaignId or campaign must be provided');
    }
    objectiveHint = input.campaign.objective;
    const c = await createCampaign(creds, adAccountId, input.campaign);
    campaignId = c.id;
  }

  // 2. Ad set — reuse or create.
  let adSetId = input.adSetId;
  if (!adSetId) {
    if (!input.adSet) {
      throw new FacebookApiError('Either adSetId or adSet must be provided');
    }
    const s = await createAdSet(creds, adAccountId, { ...input.adSet, campaignId }, objectiveHint);
    adSetId = s.id;
  }

  // 3. Image upload.
  const imageHash = await uploadAdImage(creds, adAccountId, input.image);

  // 4. Creative.
  const creative = await createAdCreative(creds, adAccountId, {
    ...input.creative,
    pageId: input.pageId,
    imageHash,
  });

  // 5. Ad.
  const ad = await createAd(creds, adAccountId, {
    ...input.ad,
    adSetId,
    creativeId: creative.id,
  });

  return { campaignId, adSetId, creativeId: creative.id, adId: ad.id, imageHash };
}
