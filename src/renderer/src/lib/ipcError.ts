/**
 * Strip Electron's IPC noise from error messages before showing them to
 * the user. When a main-process `ipcMain.handle` throws, Electron wraps
 * the original message as:
 *
 *   "Error invoking remote method 'channel:name': Error: <real message>"
 *
 * We carefully crafted the trailing `<real message>` to be human-friendly,
 * so we want to surface only that — not the channel name, not the doubled
 * `Error:` prefixes, not the SDK class name. This util peels all of that
 * off so toasts and inline error banners read as the original sentence.
 */

const IPC_PREFIX = /^Error invoking remote method '[^']+':\s*/;
// Some errors arrive as `Error: <msg>` or `TypeError: <msg>` — strip any
// leading `<ClassName>: ` prefix (recursive, since Electron sometimes
// double-wraps).
const CLASS_PREFIX = /^[A-Z][A-Za-z0-9]*Error:\s*/;

export function cleanIpcError(err: unknown, fallback: string): string {
  const raw =
    err instanceof Error
      ? err.message
      : typeof err === 'string'
        ? err
        : err && typeof err === 'object' && 'message' in err && typeof err.message === 'string'
          ? err.message
          : '';

  let msg = raw.replace(IPC_PREFIX, '');
  // Peel off any `Error: ` / `TypeError: ` prefixes — one-pass loop in case
  // the error was wrapped twice on its way through the IPC bridge.
  while (CLASS_PREFIX.test(msg)) {
    msg = msg.replace(CLASS_PREFIX, '');
  }

  return msg.trim() || fallback;
}
