import { ipcMain, dialog, BrowserWindow, app } from 'electron';
import { writeFileSync } from 'fs';
import { join } from 'path';

export function registerFileHandlers(): void {
  ipcMain.handle(
    'files:download',
    async (_event, url: string, filename: string) => {
      const win = BrowserWindow.getFocusedWindow();
      if (!win) return { success: false };

      const { filePath } = await dialog.showSaveDialog(win, {
        defaultPath: join(
          app.getPath('downloads'),
          filename,
        ),
        filters: [
          { name: 'Images', extensions: ['png', 'jpg', 'jpeg', 'webp'] },
        ],
      });

      if (!filePath) return { success: false, cancelled: true };

      // Download the file
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to download');
      }
      const buffer = Buffer.from(await response.arrayBuffer());
      writeFileSync(filePath, buffer);

      return { success: true, filePath };
    },
  );
}
