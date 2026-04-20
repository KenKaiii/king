import { app, ipcMain } from 'electron';
import { checkForUpdates, downloadUpdate, getStatus, quitAndInstall } from '../services/updater';

export function registerUpdaterHandlers(): void {
  ipcMain.handle('updater:getVersion', () => app.getVersion());
  ipcMain.handle('updater:getStatus', () => getStatus());
  ipcMain.handle('updater:check', () => checkForUpdates());
  ipcMain.handle('updater:download', () => downloadUpdate());
  ipcMain.handle('updater:install', () => {
    quitAndInstall();
  });
}
