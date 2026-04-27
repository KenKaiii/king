import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import type { ApiKeyEntry } from '@/types/electron';
import { ServiceCard, type ServiceCardProps } from '@/components/api/ServiceCard';

interface FacebookSummary {
  adAccountCount: number;
  pageCount: number;
  /** Epoch ms; surfaced as a warning pill when within 5 days. */
  expiresAt?: number;
}

function formatFbSummary(s: FacebookSummary): string {
  const base = `${s.adAccountCount} ad account${s.adAccountCount === 1 ? '' : 's'} · ${s.pageCount} Page${s.pageCount === 1 ? '' : 's'}`;
  if (!s.expiresAt) return base;
  const remainingMs = s.expiresAt - Date.now();
  if (remainingMs < 5 * 24 * 60 * 60 * 1000 && remainingMs > 0) {
    const days = Math.ceil(remainingMs / (24 * 60 * 60 * 1000));
    return `${base} · ⚠︎ expires in ${days}d`;
  }
  return base;
}

interface TelegramSummary {
  username?: string;
  id?: number;
}

interface ShopifySummary {
  shopName?: string;
  currency?: string;
}

interface GoogleAdsSummary {
  customerCount: number;
}

interface TikTokSummary {
  shopName?: string;
}

interface ShopeeSummary {
  shopId?: number;
}

interface AmazonSummary {
  sellerId?: string;
}

export default function ApisPage() {
  const [savedKeys, setSavedKeys] = useState<Record<string, ApiKeyEntry>>({});
  const [savingService, setSavingService] = useState<string | null>(null);

  // Per-platform live summaries (counts, identities) shown beneath the masked key.
  const [fbSummary, setFbSummary] = useState<FacebookSummary | null>(null);
  const [telegramSummary, setTelegramSummary] = useState<TelegramSummary | null>(null);
  const [shopifySummary, setShopifySummary] = useState<ShopifySummary | null>(null);
  const [googleSummary, setGoogleSummary] = useState<GoogleAdsSummary | null>(null);
  const [tiktokSummary, setTiktokSummary] = useState<TikTokSummary | null>(null);
  const [shopeeSummary, setShopeeSummary] = useState<ShopeeSummary | null>(null);
  const [amazonSummary, setAmazonSummary] = useState<AmazonSummary | null>(null);

  const fetchKeys = useCallback(async () => {
    try {
      const keys = await window.api.apiKeys.list();
      setSavedKeys(keys);
    } catch {
      // Silently fail
    }
  }, []);

  useEffect(() => {
    void fetchKeys();
  }, [fetchKeys]);

  // Refresh per-platform summaries when their saved-state changes.
  useEffect(() => {
    let cancelled = false;
    if (!savedKeys.facebook) {
      setFbSummary(null);
      return;
    }
    void (async () => {
      try {
        const [accounts, pages, status] = await Promise.all([
          window.api.facebookAds.listAdAccounts(),
          window.api.facebookAds.listPages(),
          window.api.facebookAds.status(),
        ]);
        if (!cancelled) {
          setFbSummary({
            adAccountCount: accounts.length,
            pageCount: pages.length,
            expiresAt: status.expiresAt,
          });
          // Warn 5 days out per plan phase 5.5.
          if (
            status.expiresAt &&
            status.expiresAt - Date.now() < 5 * 24 * 60 * 60 * 1000 &&
            status.expiresAt > Date.now()
          ) {
            const days = Math.max(
              0,
              Math.ceil((status.expiresAt - Date.now()) / (24 * 60 * 60 * 1000)),
            );
            toast.warning(
              `Facebook token expires in ${days} day${days === 1 ? '' : 's'}. Reconnect to refresh.`,
            );
          }
        }
      } catch {
        if (!cancelled) setFbSummary(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [savedKeys.facebook]);

  useEffect(() => {
    let cancelled = false;
    if (!savedKeys.telegram || !window.api.telegram) return;
    void (async () => {
      try {
        const status = await window.api.telegram!.status();
        if (!cancelled) setTelegramSummary(status.identity ?? null);
      } catch {
        if (!cancelled) setTelegramSummary(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [savedKeys.telegram]);

  useEffect(() => {
    let cancelled = false;
    if (!savedKeys.shopify || !window.api.shopify) return;
    void (async () => {
      try {
        const status = await window.api.shopify!.status();
        if (!cancelled) setShopifySummary(status.shop ?? null);
      } catch {
        if (!cancelled) setShopifySummary(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [savedKeys.shopify]);

  useEffect(() => {
    let cancelled = false;
    if (!savedKeys['google-ads'] || !window.api.googleAds) return;
    void (async () => {
      try {
        const status = await window.api.googleAds!.status();
        if (!cancelled) setGoogleSummary({ customerCount: status.customerIds?.length ?? 0 });
      } catch {
        if (!cancelled) setGoogleSummary(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [savedKeys['google-ads']]);

  useEffect(() => {
    let cancelled = false;
    if (!savedKeys.tiktok || !window.api.tiktokShop) return;
    void (async () => {
      try {
        const status = await window.api.tiktokShop!.status();
        if (!cancelled) setTiktokSummary({ shopName: status.shopName });
      } catch {
        if (!cancelled) setTiktokSummary(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [savedKeys.tiktok]);

  useEffect(() => {
    let cancelled = false;
    if (!savedKeys.shopee || !window.api.shopee) return;
    void (async () => {
      try {
        const status = await window.api.shopee!.status();
        if (!cancelled) setShopeeSummary({ shopId: status.shopId });
      } catch {
        if (!cancelled) setShopeeSummary(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [savedKeys.shopee]);

  useEffect(() => {
    let cancelled = false;
    if (!savedKeys.amazon || !window.api.amazon) return;
    void (async () => {
      try {
        const status = await window.api.amazon!.status();
        if (!cancelled) setAmazonSummary({ sellerId: status.sellingPartnerId });
      } catch {
        if (!cancelled) setAmazonSummary(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [savedKeys.amazon]);

  const saveSimpleToken = async (serviceId: string, value: string) => {
    setSavingService(serviceId);
    try {
      await window.api.apiKeys.set(serviceId, value);
      await fetchKeys();
      toast.success('API key saved.');
    } catch {
      toast.error("Couldn't save your API key. Please try again.");
    } finally {
      setSavingService(null);
    }
  };

  const handleDelete = async (serviceId: string) => {
    try {
      await window.api.apiKeys.delete(serviceId);
      // Clear the per-platform summary so a stale identity doesn't linger
      // until the user reconnects.
      if (serviceId === 'facebook') setFbSummary(null);
      else if (serviceId === 'telegram') setTelegramSummary(null);
      else if (serviceId === 'shopify') setShopifySummary(null);
      else if (serviceId === 'google-ads') setGoogleSummary(null);
      else if (serviceId === 'tiktok') setTiktokSummary(null);
      else if (serviceId === 'shopee') setShopeeSummary(null);
      else if (serviceId === 'amazon') setAmazonSummary(null);
      await fetchKeys();
      toast.success('API key removed.');
    } catch {
      toast.error("Couldn't remove your API key. Please try again.");
    }
  };

  // ---- Per-platform handlers ----

  const handleSaveTelegram = async (values: Record<string, string>) => {
    if (!window.api.telegram) {
      toast.error('Telegram integration not available.');
      return;
    }
    setSavingService('telegram');
    try {
      const result = await window.api.telegram.saveToken(values.botToken!.trim());
      await fetchKeys();
      setTelegramSummary({ username: result.username, id: result.id });
      toast.success(`Connected — @${result.username}`);
    } catch (err) {
      toast.error(`Telegram: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setSavingService(null);
    }
  };

  const handleSaveShopify = async (values: Record<string, string>) => {
    if (!window.api.shopify) {
      toast.error('Shopify integration not available.');
      return;
    }
    setSavingService('shopify');
    try {
      const result = await window.api.shopify.saveCredentials({
        shopDomain: values.shopDomain!.trim(),
        accessToken: values.accessToken!.trim(),
      });
      await fetchKeys();
      setShopifySummary({ shopName: result.shopName, currency: result.currency });
      toast.success(`Connected — ${result.shopName}`);
    } catch (err) {
      toast.error(`Shopify: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setSavingService(null);
    }
  };

  const handleSaveFacebook = async (values: Record<string, string>) => {
    setSavingService('facebook');
    try {
      const result = await window.api.facebookAds.saveCredentials({
        accessToken: values.accessToken!.trim(),
        defaultAdAccountId: values.defaultAdAccountId?.trim() || undefined,
        defaultPageId: values.defaultPageId?.trim() || undefined,
      });
      await fetchKeys();
      setFbSummary({ adAccountCount: result.adAccountCount, pageCount: result.pageCount });
      toast.success(
        `Connected — ${result.adAccountCount} ad account${result.adAccountCount === 1 ? '' : 's'} · ${result.pageCount} Page${result.pageCount === 1 ? '' : 's'}`,
      );
    } catch (err) {
      toast.error(`Facebook: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setSavingService(null);
    }
  };

  const handleConnectOAuth = async (serviceId: 'google-ads' | 'tiktok' | 'shopee' | 'amazon') => {
    const apis = {
      'google-ads': window.api.googleAds,
      tiktok: window.api.tiktokShop,
      shopee: window.api.shopee,
      amazon: window.api.amazon,
    } as const;
    const target = apis[serviceId];
    if (!target) {
      toast.error('Integration not available.');
      return;
    }
    setSavingService(serviceId);
    try {
      await target.beginOAuth();
      await fetchKeys();
      toast.success('Connected.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Connection failed.');
    } finally {
      setSavingService(null);
    }
  };

  // ---- Card configs ----

  const cards: ServiceCardProps[] = [
    {
      variant: 'simpleToken',
      name: 'fal.ai',
      description: 'Powers AI image generation',
      keyUrl: 'https://fal.ai/dashboard/keys',
      keyUrlLabel: 'Get your key',
      placeholder: 'Paste your fal.ai key here',
      saved: !!savedKeys.fal,
      maskedKey: savedKeys.fal?.maskedKey,
      saving: savingService === 'fal',
      onSave: (v) => saveSimpleToken('fal', v),
      onDelete: () => handleDelete('fal'),
    },
    {
      variant: 'oauth',
      name: 'Shopee',
      description: 'Pull products from your Shopee store',
      keyUrl: 'https://open.shopee.com/',
      keyUrlLabel: 'Connect',
      saved: !!savedKeys.shopee,
      maskedKey: savedKeys.shopee?.maskedKey,
      savedSummary: shopeeSummary?.shopId ? `Shop ${shopeeSummary.shopId}` : null,
      saving: savingService === 'shopee',
      onConnect: () => handleConnectOAuth('shopee'),
      onDelete: () => handleDelete('shopee'),
      buttonLabel: 'Connect Shopee',
    },
    {
      variant: 'oauth',
      name: 'Google Ads',
      description: 'Run and manage Google ad campaigns',
      keyUrl: 'https://ads.google.com/aw/apicenter',
      keyUrlLabel: 'Setup guide',
      saved: !!savedKeys['google-ads'],
      maskedKey: savedKeys['google-ads']?.maskedKey,
      savedSummary: googleSummary
        ? `${googleSummary.customerCount} customer${googleSummary.customerCount === 1 ? '' : 's'}`
        : null,
      saving: savingService === 'google-ads',
      onConnect: () => handleConnectOAuth('google-ads'),
      onDelete: () => handleDelete('google-ads'),
      buttonLabel: 'Connect Google Ads',
    },
    {
      variant: 'oauth',
      name: 'Amazon',
      description: 'Pull products from your Amazon listings',
      keyUrl: 'https://developer-docs.amazon.com/sp-api/',
      keyUrlLabel: 'Setup guide',
      saved: !!savedKeys.amazon,
      maskedKey: savedKeys.amazon?.maskedKey,
      savedSummary: amazonSummary?.sellerId ? `Seller ${amazonSummary.sellerId}` : null,
      saving: savingService === 'amazon',
      onConnect: () => handleConnectOAuth('amazon'),
      onDelete: () => handleDelete('amazon'),
      buttonLabel: 'Connect Amazon',
    },
    {
      variant: 'multiField',
      name: 'Facebook Ads',
      description: 'Run and manage Facebook ad campaigns',
      keyUrl: 'https://developers.facebook.com/tools/explorer/',
      keyUrlLabel: 'Get a token',
      saved: !!savedKeys.facebook,
      maskedKey: savedKeys.facebook?.maskedKey,
      savedSummary: fbSummary ? formatFbSummary(fbSummary) : null,
      saving: savingService === 'facebook',
      buttonLabel: 'Connect',
      footnote:
        "Leave both blank and we'll pick the first ad account and Page on your Facebook account. You can switch any time.",
      fields: [
        {
          key: 'accessToken',
          label: 'Access token',
          placeholder: 'Paste your Facebook access token',
          required: true,
          type: 'password',
        },
        {
          key: 'defaultAdAccountId',
          label: 'Default ad account',
          placeholder: "Default ad account ID (we'll auto-pick if blank)",
          required: false,
          type: 'text',
        },
        {
          key: 'defaultPageId',
          label: 'Default Page',
          placeholder: 'Default Facebook Page ID (optional)',
          required: false,
          type: 'text',
        },
      ],
      onSave: handleSaveFacebook,
      onDelete: () => handleDelete('facebook'),
      oauthButton: {
        label: 'Connect with Facebook',
        onConnect: async () => {
          setSavingService('facebook');
          try {
            const result = await window.api.facebookAds.beginOAuth();
            await fetchKeys();
            setFbSummary({
              adAccountCount: result.adAccountCount,
              pageCount: result.pageCount,
            });
            toast.success('Connected via Facebook.');
          } catch (err) {
            toast.error(`Facebook: ${err instanceof Error ? err.message : 'Connection failed'}`);
          } finally {
            setSavingService(null);
          }
        },
      },
    },
    {
      variant: 'multiField',
      name: 'Shopify',
      description: 'Sync products and orders from Shopify',
      keyUrl:
        'https://shopify.dev/docs/apps/build/authentication-authorization/access-tokens/generate-app-access-tokens-admin',
      keyUrlLabel: 'Custom-app guide',
      saved: !!savedKeys.shopify,
      maskedKey: savedKeys.shopify?.maskedKey,
      savedSummary: shopifySummary?.shopName
        ? `${shopifySummary.shopName}${shopifySummary.currency ? ` · ${shopifySummary.currency}` : ''}`
        : null,
      saving: savingService === 'shopify',
      buttonLabel: 'Connect',
      footnote:
        'Create a custom app in the Shopify Dev Dashboard (legacy in-admin custom apps were removed Jan 1, 2026), install it on your store, then paste the Admin API access token below.',
      fields: [
        {
          key: 'shopDomain',
          label: 'Shop domain',
          placeholder: 'mystore.myshopify.com',
          required: true,
          type: 'text',
        },
        {
          key: 'accessToken',
          label: 'Admin API access token',
          placeholder: 'shpat_… or shpua_… (Admin API access token)',
          required: true,
          type: 'password',
        },
      ],
      onSave: handleSaveShopify,
      onDelete: () => handleDelete('shopify'),
    },
    {
      variant: 'oauth',
      name: 'TikTok Shop',
      description: 'Pull products and orders from TikTok Shop',
      keyUrl: 'https://partner.tiktokshop.com/',
      keyUrlLabel: 'Setup guide',
      saved: !!savedKeys.tiktok,
      maskedKey: savedKeys.tiktok?.maskedKey,
      savedSummary: tiktokSummary?.shopName ?? null,
      saving: savingService === 'tiktok',
      onConnect: () => handleConnectOAuth('tiktok'),
      onDelete: () => handleDelete('tiktok'),
      buttonLabel: 'Connect TikTok Shop',
    },
    {
      variant: 'multiField',
      name: 'Telegram',
      description: 'Send messages and media via Telegram',
      keyUrl: 'https://t.me/BotFather',
      keyUrlLabel: 'Create a bot',
      saved: !!savedKeys.telegram,
      maskedKey: savedKeys.telegram?.maskedKey,
      savedSummary: telegramSummary?.username ? `@${telegramSummary.username}` : null,
      saving: savingService === 'telegram',
      buttonLabel: 'Connect',
      fields: [
        {
          key: 'botToken',
          label: 'Bot token',
          placeholder: 'Paste your bot token from @BotFather',
          required: true,
          type: 'password',
        },
      ],
      onSave: handleSaveTelegram,
      onDelete: () => handleDelete('telegram'),
    },
  ];

  return (
    <main className="flex-1 overflow-y-auto">
      <div className="mx-auto flex max-w-4xl flex-col gap-8 px-6 pt-8 pb-8 md:px-10">
        <section className="flex flex-col gap-3">
          <span className="eyebrow self-start">Settings</span>
          <h2
            className="text-4xl font-bold tracking-tight text-[var(--base-color-brand--bean)] sm:text-5xl"
            style={{ fontFamily: 'var(--text-color--font-family--heading)' }}
          >
            API <span className="text-[var(--base-color-brand--cinamon)]">Keys</span>
          </h2>
          <p className="text-sm text-[var(--base-color-brand--umber)]">
            Hook up the apps you use so King can pull your data and post on your behalf.
          </p>
        </section>

        <div className="grid grid-cols-2 gap-4">
          {cards.map((card) => (
            <ServiceCard key={card.name} {...card} />
          ))}
        </div>
      </div>
    </main>
  );
}
