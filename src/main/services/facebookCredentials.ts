import { getApiKey, setApiKey, deleteApiKey } from './apiKeyStore';

/**
 * Structured Facebook credential blob persisted as the JSON-encoded value
 * of the `facebook` entry in the existing `apiKeyStore`. Encryption /
 * masking is handled by `apiKeyStore` (safeStorage) — this module just
 * wraps the JSON encoding so callers don't have to repeat the parse/serialize
 * dance everywhere.
 */
export interface FacebookCredentials {
  accessToken: string;
  /** Default ad account override, e.g. `act_1234567890`. Optional — every
   *  account-scoped API takes an explicit override. */
  defaultAdAccountId?: string;
  /** Default Facebook Page id used as `page_id` in `object_story_spec`. */
  defaultPageId?: string;
  /** Epoch ms when the long-lived token expires (60d window). Absent for
   *  paste-in tokens we couldn't exchange (no FACEBOOK_APP_ID configured). */
  expiresAt?: number;
}

const SERVICE = 'facebook';

/**
 * Read the saved credential. Returns `null` if no key has been saved or the
 * stored blob can't be parsed (e.g. legacy plaintext entry that wasn't
 * JSON-encoded — those are surfaced as `accessToken`-only credentials so
 * the user doesn't lose access on upgrade).
 */
export function getFacebookCredentials(): FacebookCredentials | null {
  const raw = getApiKey(SERVICE);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<FacebookCredentials>;
    if (typeof parsed === 'object' && parsed && typeof parsed.accessToken === 'string') {
      return {
        accessToken: parsed.accessToken,
        defaultAdAccountId:
          typeof parsed.defaultAdAccountId === 'string' && parsed.defaultAdAccountId.length > 0
            ? parsed.defaultAdAccountId
            : undefined,
        defaultPageId:
          typeof parsed.defaultPageId === 'string' && parsed.defaultPageId.length > 0
            ? parsed.defaultPageId
            : undefined,
        expiresAt: typeof parsed.expiresAt === 'number' ? parsed.expiresAt : undefined,
      };
    }
    return null;
  } catch {
    // Legacy: bare token string, not JSON.
    return { accessToken: raw };
  }
}

export async function setFacebookCredentials(creds: FacebookCredentials): Promise<void> {
  const blob: FacebookCredentials = {
    accessToken: creds.accessToken,
    ...(creds.defaultAdAccountId ? { defaultAdAccountId: creds.defaultAdAccountId } : {}),
    ...(creds.defaultPageId ? { defaultPageId: creds.defaultPageId } : {}),
    ...(creds.expiresAt ? { expiresAt: creds.expiresAt } : {}),
  };
  await setApiKey(SERVICE, JSON.stringify(blob));
}

export async function clearFacebookCredentials(): Promise<void> {
  await deleteApiKey(SERVICE);
}

/**
 * Resolve the ad account id for a request: explicit argument first, saved
 * default second. Throws if neither is available so handlers fail with a
 * clean error instead of sending an undefined-id Graph call.
 */
export function resolveAdAccountId(
  creds: FacebookCredentials,
  explicit: string | undefined,
): string {
  const id = explicit?.trim() || creds.defaultAdAccountId;
  if (!id) {
    throw new Error(
      'No ad account specified. Pass adAccountId on the request or save a default in API Keys.',
    );
  }
  // FB requires the `act_` prefix on /act_{id}/ paths; tolerate either form
  // on input.
  return id.startsWith('act_') ? id : `act_${id}`;
}
