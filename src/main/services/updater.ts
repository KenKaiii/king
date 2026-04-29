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

/**
 * electron-updater throws a wall of text whenever GitHub returns 404 for
 * `latest-mac.yml` / `latest.yml` / `latest-linux.yml` — which happens
 * routinely while a release is being uploaded (the tag exists but the
 * update manifest hasn't been attached yet) and also when releases are
 * draft-only. The full HttpError dump is useless to end users; map the
 * common cases to a single friendly sentence and keep the original in
 * the log file for debugging.
 */
function friendlyUpdaterError(raw: string): string {
  const lower = raw.toLowerCase();
  if (
    lower.includes('latest-mac.yml') ||
    lower.includes('latest.yml') ||
    lower.includes('latest-linux.yml') ||
    lower.includes('cannot find') ||
    lower.includes('404')
  ) {
    return "A new release is being prepared right now. Check back in a few minutes \u2014 the update file isn't published yet.";
  }
  if (
    lower.includes('enotfound') ||
    lower.includes('econnrefused') ||
    lower.includes('etimedout') ||
    lower.includes('network') ||
    lower.includes('getaddrinfo')
  ) {
    return "Couldn't reach the update server. Check your internet connection and try again.";
  }
  if (lower.includes('signature') || lower.includes('not signed')) {
    return 'The downloaded update failed its signature check. Try again, or download manually from the GitHub releases page.';
  }
  return "Couldn't check for updates right now. Try again in a moment.";
}

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
    const raw = err?.message ?? String(err);
    log.warn('[updater] error event:', raw);
    broadcast({
      stage: 'error',
      currentVersion: app.getVersion(),
      error: friendlyUpdaterError(raw),
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
    const raw = err instanceof Error ? err.message : String(err);
    log.warn('[updater] checkForUpdates threw:', raw);
    broadcast({
      stage: 'error',
      currentVersion: app.getVersion(),
      error: friendlyUpdaterError(raw),
    });
  }
  return latestStatus;
}

export async function downloadUpdate(): Promise<void> {
  if (!app.isPackaged) return;
  try {
    await autoUpdater.downloadUpdate();
  } catch (err) {
    const raw = err instanceof Error ? err.message : String(err);
    log.warn('[updater] downloadUpdate threw:', raw);
    broadcast({
      stage: 'error',
      currentVersion: app.getVersion(),
      error: friendlyUpdaterError(raw),
    });
  }
}

export function quitAndInstall(): void {
  // isSilent=false, isForceRunAfter=true: show the installer UI on Windows,
  // relaunch the app after install on both platforms.
  autoUpdater.quitAndInstall(false, true);
}
