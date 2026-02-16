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
    id: 'facebook',
    name: 'Facebook Ads',
    description: 'Manage and run Facebook ad campaigns',
    placeholder: 'Enter your Facebook Ads API key...',
    keyUrl: 'https://developers.facebook.com/apps/',
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
    id: 'amazon',
    name: 'Amazon',
    description: 'Pull product data from Amazon listings',
    placeholder: 'Enter your Amazon API key...',
    keyUrl: 'https://developer-docs.amazon.com/sp-api/',
    keyUrlLabel: 'Get API key',
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
    <main className="flex-1 overflow-y-auto p-6">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-2xl font-bold text-white">API Keys</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Connect external services by adding your API keys.
        </p>

        <div className="mt-6 space-y-4">
          {services.map((service) => {
            const saved = savedKeys[service.id];
            const isSaving = savingService === service.id;

            return (
              <div key={service.id} className="rounded-xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-white">{service.name}</h3>
                      <button
                        onClick={() => window.api.shell.openExternal(service.keyUrl)}
                        className="cursor-pointer text-xs text-pink-400 transition-colors hover:text-pink-300"
                      >
                        {service.keyUrlLabel} &rarr;
                      </button>
                    </div>
                    <p className="text-xs text-zinc-400">{service.description}</p>
                  </div>
                  {saved && (
                    <button
                      onClick={() => handleDelete(service.id)}
                      className="grid h-7 w-7 shrink-0 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-white/10 hover:text-red-500"
                      title="Remove key"
                    >
                      <DeleteIcon className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                {saved ? (
                  <div className="mt-3 rounded-lg border border-white/5 bg-white/5 px-3 py-2">
                    <code className="text-xs text-zinc-400">{saved.maskedKey}</code>
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
                      className="min-w-0 flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white placeholder:text-zinc-600 focus:border-pink-400/50 focus:outline-none"
                    />
                    <button
                      onClick={() => handleSave(service.id)}
                      disabled={!inputs[service.id]?.trim() || isSaving}
                      className="shrink-0 rounded-lg bg-pink-400 px-4 py-2 text-xs font-medium text-black transition-colors hover:bg-pink-500 disabled:cursor-not-allowed disabled:opacity-40"
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
