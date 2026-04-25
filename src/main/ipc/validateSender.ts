import { app, ipcMain } from 'electron';
import type { IpcMainInvokeEvent } from 'electron';
import { normalize, sep } from 'path';
import { fileURLToPath } from 'url';

/**
 * Dev: pin to the exact host/port Vite is serving on. Capturing at import time
 * means a second Vite server on another port can't satisfy this check.
 */
function getDevRendererOrigin(): { host: string; port: string } | null {
  const url = process.env['ELECTRON_RENDERER_URL'];
  if (!url) return null;
  try {
    const parsed = new URL(url);
    return { host: parsed.hostname, port: parsed.port };
  } catch {
    return null;
  }
}
const DEV_ORIGIN = getDevRendererOrigin();

/**
 * Prod: the renderer is loaded via `file://` from inside the app bundle
 * (`app.getAppPath()` points at the asar / unpacked bundle root). We require
 * the sender's URL to resolve to a path within that root so an unrelated
 * local `file://` URL cannot impersonate the renderer.
 */
function isFileUrlInsideAppBundle(parsed: URL): boolean {
  let senderPath: string;
  try {
    senderPath = normalize(fileURLToPath(parsed));
  } catch {
    return false;
  }
  const appRoot = normalize(app.getAppPath());
  return senderPath === appRoot || senderPath.startsWith(appRoot + sep);
}

/**
 * Accept IPC invocations only from the app's own renderer. Blocks requests
 * coming from any embedded iframe / webview that somehow slipped past CSP +
 * the navigation guard. Also rejects `senderFrame === null`, which happens
 * when a frame has been detached by the time the message is processed.
 *
 * Dev origin: `http://<host>:<port>` pinned to the Vite server we launched.
 * Prod origin: `file://` within `app.getAppPath()`.
 */
export function assertTrustedSender(event: IpcMainInvokeEvent): void {
  const frame = event.senderFrame;
  if (!frame) throw new Error('IPC: sender frame detached');

  const url = frame.url;
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error(`IPC: invalid sender URL ${url}`);
  }

  if (DEV_ORIGIN) {
    if (
      parsed.protocol === 'http:' &&
      parsed.hostname === DEV_ORIGIN.host &&
      parsed.port === DEV_ORIGIN.port
    ) {
      return;
    }
  }
  if (parsed.protocol === 'file:' && isFileUrlInsideAppBundle(parsed)) {
    return;
  }

  throw new Error(`IPC: untrusted sender origin ${parsed.origin} (${url})`);
}

/**
 * Drop-in replacement for `ipcMain.handle` that runs `assertTrustedSender`
 * before invoking the handler. Use this for every new handler.
 */
export function secureHandle<A extends unknown[], R>(
  channel: string,
  fn: (event: IpcMainInvokeEvent, ...args: A) => R | Promise<R>,
): void {
  ipcMain.handle(channel, (event, ...args) => {
    assertTrustedSender(event);
    return fn(event, ...(args as A));
  });
}
