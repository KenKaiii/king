import log from 'electron-log/main';
import { secureHandle } from './validateSender';
import {
  getAmazonCredentials,
  setAmazonCredentials,
  clearAmazonCredentials,
} from '../services/amazonCredentials';
import {
  beginAmazonOAuth,
  listOrders,
  listCatalogItems,
  AmazonApiError,
} from '../services/amazonClient';

function wrap<A extends unknown[], R>(fn: (...args: A) => Promise<R>): (...args: A) => Promise<R> {
  return async (...args: A) => {
    try {
      return await fn(...args);
    } catch (err) {
      if (err instanceof AmazonApiError) {
        log.warn('[amazon] api error', err.message);
        const e = new Error(err.message) as Error & { code?: number | string };
        e.code = err.code;
        throw e;
      }
      throw err;
    }
  };
}

function requireCreds() {
  const creds = getAmazonCredentials();
  if (!creds) throw new Error('Amazon is not connected. Connect in API Keys.');
  return creds;
}

export function registerAmazonHandlers(): void {
  secureHandle(
    'amazon:status',
    wrap(async () => {
      const creds = getAmazonCredentials();
      if (!creds) return { connected: false };
      return {
        connected: true,
        sellingPartnerId: creds.sellingPartnerId,
        marketplaceIds: creds.marketplaceIds,
      };
    }),
  );

  secureHandle(
    'amazon:beginOAuth',
    wrap(async () => {
      const fresh = await beginAmazonOAuth();
      await setAmazonCredentials(fresh);
      return { sellingPartnerId: fresh.sellingPartnerId ?? '' };
    }),
  );

  secureHandle(
    'amazon:disconnect',
    wrap(async () => {
      await clearAmazonCredentials();
      return { success: true };
    }),
  );

  secureHandle(
    'amazon:listOrders',
    wrap(async () => listOrders(requireCreds())),
  );
  secureHandle(
    'amazon:listCatalogItems',
    wrap(async () => listCatalogItems(requireCreds())),
  );
}
