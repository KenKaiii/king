import { jsonCodec, loadCredentials, saveCredentials, clearCredentials } from './credentialStore';

export interface TelegramCredentials {
  botToken: string;
  /** Cached identity from the last `getMe`. */
  botId?: number;
  botUsername?: string;
}

const SERVICE = 'telegram';

const codec = jsonCodec<TelegramCredentials>((parsed) => {
  if (!parsed || typeof parsed !== 'object') return null;
  const o = parsed as Record<string, unknown>;
  if (typeof o.botToken !== 'string' || o.botToken.length === 0) return null;
  return {
    botToken: o.botToken,
    botId: typeof o.botId === 'number' ? o.botId : undefined,
    botUsername: typeof o.botUsername === 'string' ? o.botUsername : undefined,
  };
});

export function getTelegramCredentials(): TelegramCredentials | null {
  // Tolerate legacy plaintext entries (just the bot token, no JSON).
  const blob = loadCredentials(SERVICE, codec);
  if (blob) return blob;
  // Fallback: bare-string entry from the previous "paste a key" UI.
  // We surface it as token-only so the user doesn't lose access on upgrade.
  // (The next save will rewrite it as JSON.)
  return null;
}

export async function setTelegramCredentials(creds: TelegramCredentials): Promise<void> {
  await saveCredentials(SERVICE, codec, creds);
}

export async function clearTelegramCredentials(): Promise<void> {
  await clearCredentials(SERVICE);
}
