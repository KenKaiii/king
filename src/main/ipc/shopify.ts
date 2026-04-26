import log from 'electron-log/main';
import { secureHandle } from './validateSender';
import {
  getShopifyCredentials,
  setShopifyCredentials,
  normaliseShopDomain,
} from '../services/shopifyCredentials';
import { getShop, listProducts, listOrders, ShopifyApiError } from '../services/shopifyClient';

function wrap<A extends unknown[], R>(fn: (...args: A) => Promise<R>): (...args: A) => Promise<R> {
  return async (...args: A) => {
    try {
      return await fn(...args);
    } catch (err) {
      if (err instanceof ShopifyApiError) {
        log.warn('[shopify] api error', err.message, { status: err.status });
        const e = new Error(err.message) as Error & { code?: number };
        e.code = err.status;
        throw e;
      }
      throw err;
    }
  };
}

function requireCreds() {
  const creds = getShopifyCredentials();
  if (!creds) throw new Error('Shopify is not connected. Save your store credentials in API Keys.');
  return creds;
}

export function registerShopifyHandlers(): void {
  secureHandle(
    'shopify:status',
    wrap(async () => {
      const creds = getShopifyCredentials();
      if (!creds) return { connected: false };
      return {
        connected: true,
        shopDomain: creds.shopDomain,
        shop:
          creds.shopName && creds.currency
            ? { shopName: creds.shopName, currency: creds.currency }
            : undefined,
      };
    }),
  );

  secureHandle(
    'shopify:saveCredentials',
    wrap(async (_event, input: { shopDomain: string; accessToken: string }) => {
      const shopDomain = normaliseShopDomain(input.shopDomain ?? '');
      const accessToken = input.accessToken?.trim();
      if (!shopDomain) throw new Error('Shop domain is required (e.g. mystore.myshopify.com)');
      if (!accessToken) throw new Error('Admin API access token is required');
      if (!shopDomain.endsWith('.myshopify.com')) {
        throw new Error('Shop domain must end with .myshopify.com');
      }

      // Validate up front + capture identity for the API Keys card.
      const probe = { shopDomain, accessToken };
      const shop = await getShop(probe);

      await setShopifyCredentials({
        shopDomain,
        accessToken,
        shopName: shop.name,
        currency: shop.currency,
      });
      return { shopName: shop.name, currency: shop.currency };
    }),
  );

  secureHandle(
    'shopify:listProducts',
    wrap(async (_event, limit?: number) => listProducts(requireCreds(), limit)),
  );

  secureHandle(
    'shopify:listOrders',
    wrap(async (_event, limit?: number) => listOrders(requireCreds(), limit)),
  );
}
