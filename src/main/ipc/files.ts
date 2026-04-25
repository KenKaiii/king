import { dialog, BrowserWindow, app } from 'electron';
import { writeFileSync, readFileSync } from 'fs';
import { join } from 'path';
import { resolveLocalFileUrl } from '../services/paths';
import { secureHandle } from './validateSender';

export function registerFileHandlers(): void {
  secureHandle('files:download', async (_event, url: string, filename: string) => {
    const win = BrowserWindow.getFocusedWindow();
    if (!win) return { success: false };

    const { filePath } = await dialog.showSaveDialog(win, {
      defaultPath: join(app.getPath('downloads'), filename),
      filters: [{ name: 'Images', extensions: ['png', 'jpg', 'jpeg', 'webp'] }],
    });

    if (!filePath) return { success: false, cancelled: true };

    let buffer: Buffer;

    if (url.startsWith('local-file://')) {
      const localPath = resolveLocalFileUrl(url);
      if (!localPath) {
        throw new Error('Invalid local file path');
      }
      buffer = readFileSync(localPath);
    } else {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to download');
      }
      buffer = Buffer.from(await response.arrayBuffer());
    }

    writeFileSync(filePath, buffer);

    return { success: true, filePath };
  });
}
