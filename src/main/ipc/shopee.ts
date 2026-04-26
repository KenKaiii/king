import log from 'electron-log/main';
import { secureHandle } from './validateSender';
import {
  getShopeeCredentials,
  setShopeeCredentials,
  clearShopeeCredentials,
} from '../services/shopeeCredentials';
import {
  beginShopeeOAuth,
  listProducts,
  listOrders,
  ShopeeApiError,
} from '../services/shopeeClient';

function wrap<A extends unknown[], R>(fn: (...args: A) => Promise<R>): (...args: A) => Promise<R> {
  return async (...args: A) => {
    try {
      return await fn(...args);
    } catch (err) {
      if (err instanceof ShopeeApiError) {
        log.warn('[shopee] api error', err.message);
        const e = new Error(err.message) as Error & { code?: number | string };
        e.code = err.code;
        throw e;
      }
      throw err;
    }
  };
}

function requireCreds() {
  const creds = getShopeeCredentials();
  if (!creds) throw new Error('Shopee is not connected. Connect in API Keys.');
  return creds;
}

export function registerShopeeHandlers(): void {
  secureHandle(
    'shopee:status',
    wrap(async () => {
      const creds = getShopeeCredentials();
      if (!creds) return { connected: false };
      return { connected: true, shopId: creds.shopId };
    }),
  );

  secureHandle(
    'shopee:beginOAuth',
    wrap(async () => {
      const fresh = await beginShopeeOAuth();
      await setShopeeCredentials(fresh);
      return { shopId: fresh.shopId };
    }),
  );

  secureHandle(
    'shopee:disconnect',
    wrap(async () => {
      await clearShopeeCredentials();
      return { success: true };
    }),
  );

  secureHandle(
    'shopee:listProducts',
    wrap(async () => listProducts(requireCreds())),
  );
  secureHandle(
    'shopee:listOrders',
    wrap(async () => listOrders(requireCreds())),
  );
}
