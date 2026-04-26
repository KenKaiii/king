import { getApiKey, setApiKey, deleteApiKey } from './apiKeyStore';

/**
 * Generic typed-credential blob persisted as the JSON-encoded value of a
 * single `apiKeyStore` slot. Encryption (safeStorage) is handled inside
 * `apiKeyStore` — this module only adds typed parse/serialize on top.
 *
 * Each platform has its own credential module that calls into this helper
 * with its specific `T`. See `facebookCredentials.ts`, `shopifyCredentials.ts`,
 * `googleAdsCredentials.ts`, etc.
 *
 * Intentionally tolerant of legacy plaintext entries: if the stored value
 * isn't JSON, callers can decide whether to surface it as a partial object
 * (e.g. bare access token) or treat it as missing.
 */

export interface CredentialCodec<T> {
  /** Best-effort decode. Return `null` for malformed/missing data. */
  decode(raw: string): T | null;
  encode(value: T): string;
}

/** Default codec: strict JSON object with a per-platform validator. */
export function jsonCodec<T extends object>(
  validate: (parsed: unknown) => T | null,
): CredentialCodec<T> {
  return {
    decode(raw) {
      try {
        return validate(JSON.parse(raw));
      } catch {
        return null;
      }
    },
    encode(value) {
      return JSON.stringify(value);
    },
  };
}

export function loadCredentials<T extends object>(
  service: string,
  codec: CredentialCodec<T>,
): T | null {
  const raw = getApiKey(service);
  if (!raw) return null;
  return codec.decode(raw);
}

export async function saveCredentials<T extends object>(
  service: string,
  codec: CredentialCodec<T>,
  value: T,
): Promise<void> {
  await setApiKey(service, codec.encode(value));
}

export async function clearCredentials(service: string): Promise<void> {
  await deleteApiKey(service);
}
