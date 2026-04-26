/**
 * Generic typed token-refresh wrapper used by every OAuth-backed client.
 *
 *   await withFreshToken(creds, refresh, save, async (token) => fetch(...))
 *
 * - Reads `expiresAt`; if the token is within the skew window, refresh first.
 * - Runs the fetcher; on 401, refresh once and retry.
 * - Persists the refreshed credential blob via `save` so subsequent calls
 *   reuse the new access token.
 *
 * Concurrency: we serialise refreshes per credential identity to avoid
 * stampedes when several requests fire in parallel right as the token
 * expires. Identity is provided by the caller (typically the service name).
 */

const refreshLocks = new Map<string, Promise<unknown>>();

export interface TokenLike {
  accessToken: string;
  /** Epoch ms. Optional — if absent, we won't pre-refresh; only retry on 401. */
  expiresAt?: number;
}

export interface WithFreshTokenOpts<T extends TokenLike> {
  /** Used to serialise refreshes; usually the service name. */
  lockKey: string;
  current: T;
  /** Returns the new credential blob (with fresh `accessToken` / `expiresAt`). */
  refresh: (current: T) => Promise<T>;
  /** Called whenever `refresh` produces a new blob so it's persisted. */
  save: (next: T) => Promise<void>;
  /** The actual API call. Receives the access token to use. */
  call: (token: string) => Promise<Response>;
  /** How early to refresh, in ms. Default 60s. */
  skewMs?: number;
}

const DEFAULT_SKEW_MS = 60_000;

async function runLocked<T>(key: string, fn: () => Promise<T>): Promise<T> {
  const previous = refreshLocks.get(key) ?? Promise.resolve();
  const next = previous.then(fn, fn);
  refreshLocks.set(
    key,
    next.catch(() => undefined),
  );
  return next;
}

export async function withFreshToken<T extends TokenLike>(
  opts: WithFreshTokenOpts<T>,
): Promise<{ response: Response; creds: T }> {
  let creds = opts.current;
  const skew = opts.skewMs ?? DEFAULT_SKEW_MS;

  // Pre-emptive refresh if we know the token is about to expire.
  if (typeof creds.expiresAt === 'number' && creds.expiresAt - Date.now() < skew) {
    creds = await runLocked(opts.lockKey, async () => {
      // Re-read inside the lock might be wanted here for the cross-process
      // case, but we're in-process — the caller passed us the latest blob.
      const refreshed = await opts.refresh(creds);
      await opts.save(refreshed);
      return refreshed;
    });
  }

  let response = await opts.call(creds.accessToken);
  if (response.status !== 401) return { response, creds };

  // Drain the body so the Response can be GC'd before we issue the retry.
  try {
    await response.text();
  } catch {
    /* ignore */
  }

  // Refresh once, then retry exactly once.
  creds = await runLocked(opts.lockKey, async () => {
    const refreshed = await opts.refresh(creds);
    await opts.save(refreshed);
    return refreshed;
  });
  response = await opts.call(creds.accessToken);
  return { response, creds };
}
