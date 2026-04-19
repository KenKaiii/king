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
    placeholder: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx:xxxxxxxx...',
    keyUrl: 'https://fal.ai/dashboard/keys',
    keyUrlLabel: 'Get API key',
  },
  {
    id: 'shopee',
    name: 'Shopee',
    description: 'Pull product data from Shopee stores',
    placeholder: 'Enter your Shopee API key...',
    keyUrl: 'https://open.shopee.com/',
    keyUrlLabel: 'Get API key',
  },
  {
    id: 'google-ads',
    name: 'Google Ads',
    description: 'Manage and run Google ad campaigns',
    placeholder: 'Enter your Google Ads developer token...',
    keyUrl: 'https://ads.google.com/aw/apicenter',
    keyUrlLabel: 'Get developer token',
  },
  {
    id: 'amazon',
    name: 'Amazon',
    description: 'Pull product data from Amazon listings',
    placeholder: 'Enter your Amazon API key...',
    keyUrl: 'https://developer-docs.amazon.com/sp-api/',
    keyUrlLabel: 'Get API key',
  },
  {
    id: 'facebook',
    name: 'Facebook Ads',
    description: 'Manage and run Facebook ad campaigns',
    placeholder: 'Enter your Facebook Ads API key...',
    keyUrl: 'https://developers.facebook.com/apps/',
    keyUrlLabel: 'Get API key',
  },
  {
    id: 'shopify',
    name: 'Shopify',
    description: 'Sync products and orders from Shopify stores',
    placeholder: 'Enter your Shopify Admin API access token...',
    keyUrl: 'https://admin.shopify.com/store/',
    keyUrlLabel: 'Get access token',
  },
  {
    id: 'telegram',
    name: 'Telegram',
    description: 'Send messages and media via Telegram bot',
    placeholder: 'Enter your Telegram bot token...',
    keyUrl: 'https://t.me/BotFather',
    keyUrlLabel: 'Create bot',
  },
];

export default function ApisPage() {
  const [savedKeys, setSavedKeys] = useState<Record<string, ApiKeyEntry>>({});
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [savingService, setSavingService] = useState<string | null>(null);

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

  const handleSave = async (serviceId: string) => {
    const key = inputs[serviceId]?.trim();
    if (!key) return;

    setSavingService(serviceId);
    try {
      await window.api.apiKeys.set(serviceId, key);
      setInputs((prev) => ({ ...prev, [serviceId]: '' }));
      await fetchKeys();
      toast.success('API key saved');
    } catch {
      toast.error('Failed to save API key');
    } finally {
      setSavingService(null);
    }
  };

  const handleDelete = async (serviceId: string) => {
    try {
      await window.api.apiKeys.delete(serviceId);
      await fetchKeys();
      toast.success('API key removed');
    } catch {
      toast.error('Failed to remove API key');
    }
  };

  return (
    <main className="flex-1 overflow-y-auto">
      <div className="mx-auto flex max-w-4xl flex-col gap-8 px-6 pt-8 pb-8 md:px-10">
        <section className="flex flex-col gap-3">
          <span className="eyebrow self-start">Settings</span>
          <h2
            className="text-4xl font-bold tracking-tight text-[var(--base-color-brand--bean)] uppercase sm:text-5xl"
            style={{ fontFamily: 'var(--text-color--font-family--heading)' }}
          >
            API <span className="text-[var(--base-color-brand--cinamon)]">Keys</span>
          </h2>
          <p className="text-sm text-[var(--base-color-brand--umber)]">
            Connect external services by adding your API keys.
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
                      title="Remove key"
                    >
                      <DeleteIcon className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                {saved ? (
                  <div className="mt-3 rounded-full border border-[var(--base-color-brand--umber)]/30 bg-[var(--base-color-brand--shell)] px-4 py-2">
                    <code className="text-xs text-[var(--base-color-brand--umber)]">
                      {saved.maskedKey}
                    </code>
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
                      className="shrink-0 rounded-full border-none bg-[var(--base-color-brand--cinamon)] px-4 py-2 text-xs font-semibold uppercase tracking-wide text-[var(--base-color-brand--shell)] shadow-[0_2px_0_0_var(--base-color-brand--dark-red)] transition-colors hover:bg-[var(--base-color-brand--red)] active:translate-y-0.5 active:shadow-none disabled:cursor-not-allowed disabled:opacity-40"
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
