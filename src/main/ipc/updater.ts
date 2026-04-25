import { app } from 'electron';
import { checkForUpdates, downloadUpdate, getStatus, quitAndInstall } from '../services/updater';
import { secureHandle } from './validateSender';

export function registerUpdaterHandlers(): void {
  secureHandle('updater:getVersion', () => app.getVersion());
  secureHandle('updater:getStatus', () => getStatus());
  secureHandle('updater:check', () => checkForUpdates());
  secureHandle('updater:download', () => downloadUpdate());
  secureHandle('updater:install', () => {
    quitAndInstall();
  });
}
