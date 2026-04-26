import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { DeleteIcon } from '@/components/icons';
import type { ApiKeyEntry } from '@/types/electron';

interface ServiceConfig {
  id: string;
  name: string;
  description: string;
  placeholder: string;
  keyUrl: string;
  keyUrlLabel: string;
}

// Ordered for 2-column grid: left = AI/Marketing/Messaging, right = Stores
const services: ServiceConfig[] = [
  {
    id: 'fal',
    name: 'fal.ai',
    description: 'Powers AI image generation',
    placeholder: 'Paste your fal.ai key here',
    keyUrl: 'https://fal.ai/dashboard/keys',
    keyUrlLabel: 'Get your key',
  },
  {
    id: 'shopee',
    name: 'Shopee',
    description: 'Pull products from your Shopee store',
    placeholder: 'Paste your Shopee key here',
    keyUrl: 'https://open.shopee.com/',
    keyUrlLabel: 'Get your key',
  },
  {
    id: 'google-ads',
    name: 'Google Ads',
    description: 'Run and manage Google ad campaigns',
    placeholder: 'Paste your Google Ads token here',
    keyUrl: 'https://ads.google.com/aw/apicenter',
    keyUrlLabel: 'Get connected',
  },
  {
    id: 'amazon',
    name: 'Amazon',
    description: 'Pull products from your Amazon listings',
    placeholder: 'Paste your Amazon key here',
    keyUrl: 'https://developer-docs.amazon.com/sp-api/',
    keyUrlLabel: 'Get your key',
  },
  {
    id: 'facebook',
    name: 'Facebook Ads',
    description: 'Run and manage Facebook ad campaigns',
    placeholder: 'Paste your Facebook key here',
    keyUrl: 'https://developers.facebook.com/tools/explorer/',
    keyUrlLabel: 'Get connected',
  },
  {
    id: 'shopify',
    name: 'Shopify',
    description: 'Sync products and orders from Shopify',
    placeholder: 'Paste your Shopify token here',
    keyUrl: 'https://admin.shopify.com/store/',
    keyUrlLabel: 'Get connected',
  },
  {
    id: 'tiktok',
    name: 'TikTok Shop',
    description: 'Pull products and orders from TikTok Shop',
    placeholder: 'Paste your TikTok Shop key here',
    keyUrl: 'https://partner.tiktokshop.com/',
    keyUrlLabel: 'Get your key',
  },
  {
    id: 'telegram',
    name: 'Telegram',
    description: 'Send messages and media via Telegram',
    placeholder: 'Paste your bot token here',
    keyUrl: 'https://t.me/BotFather',
    keyUrlLabel: 'Create a bot',
  },
];

interface FacebookFormState {
  accessToken: string;
  defaultAdAccountId: string;
  defaultPageId: string;
}

const EMPTY_FB_FORM: FacebookFormState = {
  accessToken: '',
  defaultAdAccountId: '',
  defaultPageId: '',
};

interface FacebookSummary {
  adAccountCount: number;
  pageCount: number;
}

export default function ApisPage() {
  const [savedKeys, setSavedKeys] = useState<Record<string, ApiKeyEntry>>({});
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [savingService, setSavingService] = useState<string | null>(null);
  const [fbForm, setFbForm] = useState<FacebookFormState>(EMPTY_FB_FORM);
  const [fbSummary, setFbSummary] = useState<FacebookSummary | null>(null);

  const fetchKeys = useCallback(async () => {
    try {
      const keys = await window.api.apiKeys.list();
      setSavedKeys(keys);
    } catch {
      // Silently fail
    }
  }, []);

  useEffect(() => {
    fetchKeys();
  }, [fetchKeys]);

  // Refresh the FB summary line whenever the saved key changes.
  useEffect(() => {
    let cancelled = false;
    if (!savedKeys.facebook) {
      setFbSummary(null);
      return;
    }
    void (async () => {
      try {
        const [accounts, pages] = await Promise.all([
          window.api.facebookAds.listAdAccounts(),
          window.api.facebookAds.listPages(),
        ]);
        if (!cancelled) {
          setFbSummary({ adAccountCount: accounts.length, pageCount: pages.length });
        }
      } catch {
        if (!cancelled) setFbSummary(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [savedKeys.facebook]);

  const handleSave = async (serviceId: string) => {
    const key = inputs[serviceId]?.trim();
    if (!key) return;

    setSavingService(serviceId);
    try {
      await window.api.apiKeys.set(serviceId, key);
      setInputs((prev) => ({ ...prev, [serviceId]: '' }));
      await fetchKeys();
      toast.success('API key saved.');
    } catch {
      toast.error("Couldn't save your API key. Please try again.");
    } finally {
      setSavingService(null);
    }
  };

  const handleSaveFacebook = async () => {
    const accessToken = fbForm.accessToken.trim();
    if (!accessToken) return;
    setSavingService('facebook');
    try {
      const result = await window.api.facebookAds.saveCredentials({
        accessToken,
        defaultAdAccountId: fbForm.defaultAdAccountId.trim() || undefined,
        defaultPageId: fbForm.defaultPageId.trim() || undefined,
      });
      setFbForm(EMPTY_FB_FORM);
      await fetchKeys();
      setFbSummary({ adAccountCount: result.adAccountCount, pageCount: result.pageCount });
      toast.success(
        `Connected — ${result.adAccountCount} ad account${result.adAccountCount === 1 ? '' : 's'} · ${result.pageCount} Page${result.pageCount === 1 ? '' : 's'}`,
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      toast.error(`Facebook: ${msg}`);
    } finally {
      setSavingService(null);
    }
  };

  const handleDelete = async (serviceId: string) => {
    try {
      await window.api.apiKeys.delete(serviceId);
      await fetchKeys();
      toast.success('API key removed.');
    } catch {
      toast.error("Couldn't remove your API key. Please try again.");
    }
  };

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
          {services.map((service) => {
            const saved = savedKeys[service.id];
            const isSaving = savingService === service.id;

            return (
              <div
                key={service.id}
                className="rounded-2xl border border-[var(--base-color-brand--umber)]/30 bg-[var(--base-color-brand--champagne)] p-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3
                        className="text-sm font-semibold text-[var(--base-color-brand--bean)]"
                        style={{ fontFamily: 'var(--text-color--font-family--heading)' }}
                      >
                        {service.name}
                      </h3>
                      <button
                        onClick={() => window.api.shell.openExternal(service.keyUrl)}
                        className="cursor-pointer text-xs font-semibold text-[var(--base-color-brand--cinamon)] transition-colors hover:text-[var(--base-color-brand--red)]"
                      >
                        {service.keyUrlLabel} &rarr;
                      </button>
                    </div>
                    <p className="text-xs text-[var(--base-color-brand--umber)]">
                      {service.description}
                    </p>
                  </div>
                  {saved && (
                    <button
                      onClick={() => handleDelete(service.id)}
                      className="grid h-7 w-7 shrink-0 items-center justify-center rounded-full text-[var(--base-color-brand--umber)] transition-colors hover:bg-[var(--base-color-brand--dark-red)] hover:text-[var(--base-color-brand--shell)]"
                      title="Remove"
                    >
                      <DeleteIcon className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                {saved && service.id === 'facebook' ? (
                  <div className="mt-3 flex flex-col gap-1">
                    <div className="rounded-full border border-[var(--base-color-brand--umber)]/30 bg-[var(--base-color-brand--shell)] px-4 py-2">
                      <code className="text-xs text-[var(--base-color-brand--umber)]">
                        {saved.maskedKey}
                      </code>
                    </div>
                    {fbSummary && (
                      <span className="px-1 text-[10px] text-[var(--base-color-brand--umber)]">
                        {fbSummary.adAccountCount} ad account
                        {fbSummary.adAccountCount === 1 ? '' : 's'} · {fbSummary.pageCount} Page
                        {fbSummary.pageCount === 1 ? '' : 's'}
                      </span>
                    )}
                  </div>
                ) : saved ? (
                  <div className="mt-3 rounded-full border border-[var(--base-color-brand--umber)]/30 bg-[var(--base-color-brand--shell)] px-4 py-2">
                    <code className="text-xs text-[var(--base-color-brand--umber)]">
                      {saved.maskedKey}
                    </code>
                  </div>
                ) : service.id === 'facebook' ? (
                  <div className="mt-3 flex flex-col gap-2">
                    <input
                      type="password"
                      value={fbForm.accessToken}
                      onChange={(e) =>
                        setFbForm((prev) => ({ ...prev, accessToken: e.target.value }))
                      }
                      placeholder={service.placeholder}
                      className="min-w-0 rounded-full border border-[var(--base-color-brand--umber)]/50 bg-[var(--base-color-brand--shell)] px-4 py-2 text-xs text-[var(--text-color--text-primary)] placeholder:text-[var(--base-color-brand--umber)]/60 focus:border-[var(--base-color-brand--bean)] focus:outline-none"
                    />
                    <input
                      type="text"
                      value={fbForm.defaultAdAccountId}
                      onChange={(e) =>
                        setFbForm((prev) => ({ ...prev, defaultAdAccountId: e.target.value }))
                      }
                      placeholder="Default ad account ID (we'll auto-pick if blank)"
                      className="min-w-0 rounded-full border border-[var(--base-color-brand--umber)]/50 bg-[var(--base-color-brand--shell)] px-4 py-2 text-xs text-[var(--text-color--text-primary)] placeholder:text-[var(--base-color-brand--umber)]/60 focus:border-[var(--base-color-brand--bean)] focus:outline-none"
                    />
                    <input
                      type="text"
                      value={fbForm.defaultPageId}
                      onChange={(e) =>
                        setFbForm((prev) => ({ ...prev, defaultPageId: e.target.value }))
                      }
                      placeholder="Default Facebook Page ID (optional)"
                      className="min-w-0 rounded-full border border-[var(--base-color-brand--umber)]/50 bg-[var(--base-color-brand--shell)] px-4 py-2 text-xs text-[var(--text-color--text-primary)] placeholder:text-[var(--base-color-brand--umber)]/60 focus:border-[var(--base-color-brand--bean)] focus:outline-none"
                    />
                    <p className="px-1 text-[10px] leading-tight text-[var(--base-color-brand--umber)]">
                      Leave both blank and we&apos;ll pick the first ad account and Page on your
                      Facebook account. You can switch any time.
                    </p>
                    <button
                      onClick={handleSaveFacebook}
                      disabled={!fbForm.accessToken.trim() || isSaving}
                      className="self-end rounded-full border-none bg-[var(--base-color-brand--cinamon)] px-4 py-2 text-xs font-semibold tracking-wide text-[var(--base-color-brand--shell)] shadow-[0_2px_0_0_var(--base-color-brand--dark-red)] transition-colors hover:bg-[var(--base-color-brand--red)] active:translate-y-0.5 active:shadow-none disabled:cursor-not-allowed disabled:opacity-40"
                      style={{ fontFamily: 'var(--text-color--font-family--heading)' }}
                    >
                      {isSaving ? 'Connecting…' : 'Connect'}
                    </button>
                  </div>
                ) : (
                  <div className="mt-3 flex gap-2">
                    <input
                      type="password"
                      value={inputs[service.id] || ''}
                      onChange={(e) =>
                        setInputs((prev) => ({ ...prev, [service.id]: e.target.value }))
                      }
                      placeholder={service.placeholder}
                      className="min-w-0 flex-1 rounded-full border border-[var(--base-color-brand--umber)]/50 bg-[var(--base-color-brand--shell)] px-4 py-2 text-xs text-[var(--text-color--text-primary)] placeholder:text-[var(--base-color-brand--umber)]/60 focus:border-[var(--base-color-brand--bean)] focus:outline-none"
                    />
                    <button
                      onClick={() => handleSave(service.id)}
                      disabled={!inputs[service.id]?.trim() || isSaving}
                      className="shrink-0 rounded-full border-none bg-[var(--base-color-brand--cinamon)] px-4 py-2 text-xs font-semibold tracking-wide text-[var(--base-color-brand--shell)] shadow-[0_2px_0_0_var(--base-color-brand--dark-red)] transition-colors hover:bg-[var(--base-color-brand--red)] active:translate-y-0.5 active:shadow-none disabled:cursor-not-allowed disabled:opacity-40"
                      style={{ fontFamily: 'var(--text-color--font-family--heading)' }}
                    >
                      {isSaving ? '...' : 'Save'}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
