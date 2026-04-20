/**
 * Auto-update service backed by electron-updater (v6).
 *
 * Pulls the latest release from the GitHub repo configured in package.json's
 * `build.publish` block. We run with `autoDownload: false` so the UI can gate
 * the download behind an explicit user action.
 *
 * Lifecycle events are broadcast to the renderer on the 'updater:status'
 * channel so the Settings modal can reflect state in real time.
 */

import { app, BrowserWindow } from 'electron';
import pkg from 'electron-updater';
import log from 'electron-log/main';

const { autoUpdater } = pkg;

export type UpdaterStage =
  | 'idle'
  | 'checking'
  | 'available'
  | 'not-available'
  | 'downloading'
  | 'downloaded'
  | 'error';

export interface UpdaterStatus {
  stage: UpdaterStage;
  currentVersion: string;
  /** Version string of the available / downloaded update. */
  updateVersion?: string;
  /** Release notes (plain string from GitHub). */
  releaseNotes?: string;
  /** Download progress 0–100 (only during 'downloading'). */
  progress?: number;
  /** Bytes per second during download. */
  bytesPerSecond?: number;
  /** Error message when stage === 'error'. */
  error?: string;
}

let latestStatus: UpdaterStatus = {
  stage: 'idle',
  currentVersion: app.getVersion(),
};

function broadcast(status: UpdaterStatus): void {
  latestStatus = status;
  for (const win of BrowserWindow.getAllWindows()) {
    if (!win.isDestroyed()) {
      win.webContents.send('updater:status', status);
    }
  }
}

export function getStatus(): UpdaterStatus {
  return latestStatus;
}

export function initUpdater(): void {
  // Route updater logs through electron-log — shows up in userData/logs/main.log
  // and is the recommended diagnostic channel for update issues.
  log.transports.file.level = 'info';
  autoUpdater.logger = log;

  // Never auto-download — the UI drives this explicitly.
  autoUpdater.autoDownload = false;
  autoUpdater.autoInstallOnAppQuit = false;
  autoUpdater.allowDowngrade = false;

  autoUpdater.on('checking-for-update', () => {
    broadcast({ stage: 'checking', currentVersion: app.getVersion() });
  });

  autoUpdater.on('update-available', (info) => {
    broadcast({
      stage: 'available',
      currentVersion: app.getVersion(),
      updateVersion: info.version,
      releaseNotes: typeof info.releaseNotes === 'string' ? info.releaseNotes : undefined,
    });
  });

  autoUpdater.on('update-not-available', (info) => {
    broadcast({
      stage: 'not-available',
      currentVersion: app.getVersion(),
      updateVersion: info.version,
    });
  });

  autoUpdater.on('download-progress', (progress) => {
    broadcast({
      stage: 'downloading',
      currentVersion: app.getVersion(),
      updateVersion: latestStatus.updateVersion,
      progress: Math.round(progress.percent),
      bytesPerSecond: progress.bytesPerSecond,
    });
  });

  autoUpdater.on('update-downloaded', (info) => {
    broadcast({
      stage: 'downloaded',
      currentVersion: app.getVersion(),
      updateVersion: info.version,
      releaseNotes: typeof info.releaseNotes === 'string' ? info.releaseNotes : undefined,
    });
  });

  autoUpdater.on('error', (err) => {
    broadcast({
      stage: 'error',
      currentVersion: app.getVersion(),
      error: err?.message ?? String(err),
    });
  });
}

export async function checkForUpdates(): Promise<UpdaterStatus> {
  // In dev mode electron-updater refuses to run without dev-app-update.yml.
  // We surface that as a friendly not-available state instead of crashing.
  if (!app.isPackaged) {
    const status: UpdaterStatus = {
      stage: 'not-available',
      currentVersion: app.getVersion(),
      error: 'Updates are only checked in packaged builds.',
    };
    broadcast(status);
    return status;
  }

  try {
    await autoUpdater.checkForUpdates();
  } catch (err) {
    broadcast({
      stage: 'error',
      currentVersion: app.getVersion(),
      error: err instanceof Error ? err.message : String(err),
    });
  }
  return latestStatus;
}

export async function downloadUpdate(): Promise<void> {
  if (!app.isPackaged) return;
  try {
    await autoUpdater.downloadUpdate();
  } catch (err) {
    broadcast({
      stage: 'error',
      currentVersion: app.getVersion(),
      error: err instanceof Error ? err.message : String(err),
    });
  }
}

export function quitAndInstall(): void {
  // isSilent=false, isForceRunAfter=true: show the installer UI on Windows,
  // relaunch the app after install on both platforms.
  autoUpdater.quitAndInstall(false, true);
}
