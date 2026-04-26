import log from 'electron-log/main';
import { secureHandle } from './validateSender';
import {
  getTikTokShopCredentials,
  setTikTokShopCredentials,
  clearTikTokShopCredentials,
} from '../services/tiktokShopCredentials';
import {
  beginTikTokShopOAuth,
  listProducts,
  listOrders,
  TikTokApiError,
} from '../services/tiktokShopClient';

function wrap<A extends unknown[], R>(fn: (...args: A) => Promise<R>): (...args: A) => Promise<R> {
  return async (...args: A) => {
    try {
      return await fn(...args);
    } catch (err) {
      if (err instanceof TikTokApiError) {
        log.warn('[tiktok] api error', err.message);
        const e = new Error(err.message) as Error & { code?: number | string };
        e.code = err.code;
        throw e;
      }
      throw err;
    }
  };
}

function requireCreds() {
  const creds = getTikTokShopCredentials();
  if (!creds) throw new Error('TikTok Shop is not connected. Connect in API Keys.');
  return creds;
}

export function registerTiktokShopHandlers(): void {
  secureHandle(
    'tiktokShop:status',
    wrap(async () => {
      const creds = getTikTokShopCredentials();
      if (!creds) return { connected: false };
      return { connected: true, shopId: creds.shopId, shopName: creds.shopName };
    }),
  );

  secureHandle(
    'tiktokShop:beginOAuth',
    wrap(async () => {
      const fresh = await beginTikTokShopOAuth();
      await setTikTokShopCredentials(fresh);
      return { shopId: fresh.shopId, shopName: fresh.shopName };
    }),
  );

  secureHandle(
    'tiktokShop:disconnect',
    wrap(async () => {
      await clearTikTokShopCredentials();
      return { success: true };
    }),
  );

  secureHandle(
    'tiktokShop:listProducts',
    wrap(async () => listProducts(requireCreds())),
  );

  secureHandle(
    'tiktokShop:listOrders',
    wrap(async () => listOrders(requireCreds())),
  );
}
