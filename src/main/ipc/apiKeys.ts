import { getAllApiKeys, setApiKey, deleteApiKey } from '../services/apiKeyStore';
import { secureHandle } from './validateSender';

export function registerApiKeyHandlers(): void {
  secureHandle('apiKeys:list', async () => {
    return getAllApiKeys();
  });

  secureHandle('apiKeys:set', async (_event, service: string, key: string) => {
    await setApiKey(service, key);
    return { success: true };
  });

  secureHandle('apiKeys:delete', async (_event, service: string) => {
    await deleteApiKey(service);
    return { success: true };
  });
}
