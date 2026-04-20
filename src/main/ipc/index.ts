import { ipcMain, shell } from 'electron';
import { registerImageHandlers } from './images';
import { registerGenerateHandlers } from './generate';
import { registerFileHandlers } from './files';
import { registerEntityHandlers } from './entities';
import { registerApiKeyHandlers } from './apiKeys';
import { registerUpdaterHandlers } from './updater';

export function registerIpcHandlers(): void {
  registerImageHandlers();
  registerGenerateHandlers();
  registerFileHandlers();
  registerEntityHandlers();
  registerApiKeyHandlers();
  registerUpdaterHandlers();

  ipcMain.handle('shell:openExternal', (_event, url: string) => {
    if (typeof url === 'string' && (url.startsWith('https://') || url.startsWith('http://'))) {
      return shell.openExternal(url);
    }
  });
}
