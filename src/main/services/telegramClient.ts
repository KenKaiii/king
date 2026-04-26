import type { TelegramCredentials } from './telegramCredentials';

/**
 * Thin Telegram Bot API client. Spec: https://core.telegram.org/bots/api
 *
 * Only methods used by the app are wrapped. Every call goes through `bot<TOKEN>/<method>`
 * and returns the unwrapped `result` field on success. Errors are surfaced as
 * `TelegramApiError` with the `description` from the Bot API.
 */

const BASE = 'https://api.telegram.org';

export class TelegramApiError extends Error {
  errorCode?: number;
  constructor(message: string, errorCode?: number) {
    super(message);
    this.name = 'TelegramApiError';
    this.errorCode = errorCode;
  }
}

interface TgEnvelope<T> {
  ok: boolean;
  result?: T;
  description?: string;
  error_code?: number;
}

async function call<T>(
  token: string,
  method: string,
  params: Record<string, unknown> = {},
): Promise<T> {
  const res = await fetch(`${BASE}/bot${token}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  const text = await res.text();
  let body: TgEnvelope<T>;
  try {
    body = text ? (JSON.parse(text) as TgEnvelope<T>) : { ok: false };
  } catch {
    throw new TelegramApiError(`Telegram API non-JSON response (${res.status})`, res.status);
  }
  if (!body.ok || body.result === undefined) {
    throw new TelegramApiError(
      body.description || `HTTP ${res.status}`,
      body.error_code ?? res.status,
    );
  }
  return body.result;
}

export interface TelegramUser {
  id: number;
  is_bot: boolean;
  first_name: string;
  username?: string;
}

export async function getMe(token: string): Promise<TelegramUser> {
  return call<TelegramUser>(token, 'getMe');
}

export async function sendMessage(
  creds: TelegramCredentials,
  chatId: string | number,
  text: string,
): Promise<{ messageId: number }> {
  const result = await call<{ message_id: number }>(creds.botToken, 'sendMessage', {
    chat_id: chatId,
    text,
  });
  return { messageId: result.message_id };
}

export async function sendPhoto(
  creds: TelegramCredentials,
  chatId: string | number,
  photoUrl: string,
  caption?: string,
): Promise<{ messageId: number }> {
  const result = await call<{ message_id: number }>(creds.botToken, 'sendPhoto', {
    chat_id: chatId,
    photo: photoUrl,
    ...(caption ? { caption } : {}),
  });
  return { messageId: result.message_id };
}
