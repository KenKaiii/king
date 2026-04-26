import log from 'electron-log/main';
import { secureHandle } from './validateSender';
import { getTelegramCredentials, setTelegramCredentials } from '../services/telegramCredentials';
import { getMe, sendMessage, TelegramApiError } from '../services/telegramClient';

function wrap<A extends unknown[], R>(fn: (...args: A) => Promise<R>): (...args: A) => Promise<R> {
  return async (...args: A) => {
    try {
      return await fn(...args);
    } catch (err) {
      if (err instanceof TelegramApiError) {
        log.warn('[telegram] api error', err.message);
        const e = new Error(err.message) as Error & { code?: number };
        e.code = err.errorCode;
        throw e;
      }
      throw err;
    }
  };
}

function requireCreds() {
  const creds = getTelegramCredentials();
  if (!creds) throw new Error('Telegram is not connected. Save a bot token in API Keys.');
  return creds;
}

export function registerTelegramHandlers(): void {
  secureHandle(
    'telegram:status',
    wrap(async () => {
      const creds = getTelegramCredentials();
      if (!creds) return { connected: false };
      return {
        connected: true,
        identity:
          creds.botId !== undefined && creds.botUsername
            ? { id: creds.botId, username: creds.botUsername }
            : undefined,
      };
    }),
  );

  secureHandle(
    'telegram:saveToken',
    wrap(async (_event, botToken: string) => {
      const trimmed = botToken?.trim();
      if (!trimmed) throw new Error('Bot token is required');
      // Validate up front via getMe — surfaces invalid tokens immediately.
      const me = await getMe(trimmed);
      if (!me.is_bot) throw new Error('Token does not belong to a bot account.');
      await setTelegramCredentials({
        botToken: trimmed,
        botId: me.id,
        botUsername: me.username,
      });
      return { id: me.id, username: me.username ?? '' };
    }),
  );

  secureHandle(
    'telegram:sendMessage',
    wrap(async (_event, chatId: string | number, text: string) => {
      return sendMessage(requireCreds(), chatId, text);
    }),
  );
}
