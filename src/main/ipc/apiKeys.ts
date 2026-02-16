import { ipcMain } from 'electron';
import { getAllApiKeys, setApiKey, deleteApiKey } from '../services/apiKeyStore';

export function registerApiKeyHandlers(): void {
  ipcMain.handle('apiKeys:list', async () => {
    return getAllApiKeys();
  });

  ipcMain.handle('apiKeys:set', async (_event, service: string, key: string) => {
    setApiKey(service, key);
    return { success: true };
  });

  ipcMain.handle('apiKeys:delete', async (_event, service: string) => {
    deleteApiKey(service);
    return { success: true };
  });
}
