import { shell } from 'electron';
import log from 'electron-log/main';
import { registerImageHandlers } from './images';
import { registerGenerateHandlers } from './generate';
import { registerFileHandlers } from './files';
import { registerEntityHandlers } from './entities';
import { registerAdReferenceHandlers } from './adReferences';
import { registerApiKeyHandlers } from './apiKeys';
import { registerUpdaterHandlers } from './updater';
import { secureHandle } from './validateSender';

// Hosts the renderer is allowed to open in the user's browser. Keep this in
// sync with the `keyUrl` / documentation URLs referenced from
// `src/renderer/src/pages/ApisPage.tsx` and anywhere else we surface an
// external link. Exact-match or suffix match (`.endsWith('.' + host)`).
const ALLOWED_EXTERNAL_HOSTS = new Set<string>([
  'fal.ai',
  'docs.fal.ai',
  'github.com',
  'open.shopee.com',
  'ads.google.com',
  'developer-docs.amazon.com',
  'developers.facebook.com',
  'admin.shopify.com',
  't.me',
]);

function isAllowedExternalUrl(url: string): boolean {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return false;
  }
  if (parsed.protocol !== 'https:') return false;
  const host = parsed.hostname.toLowerCase();
  if (ALLOWED_EXTERNAL_HOSTS.has(host)) return true;
  for (const allowed of ALLOWED_EXTERNAL_HOSTS) {
    if (host.endsWith('.' + allowed)) return true;
  }
  return false;
}

export function registerIpcHandlers(): void {
  registerImageHandlers();
  registerGenerateHandlers();
  registerFileHandlers();
  registerEntityHandlers();
  registerAdReferenceHandlers();
  registerApiKeyHandlers();
  registerUpdaterHandlers();

  // Renderer errors (from React 19 root-level callbacks) funnel here so they
  // land in the same electron-log file as main-process errors. Rate-limited
  // and size-capped so a runaway render loop can't fill the disk or pin the
  // main thread on log I/O. Token-bucket: 20 errors / 5s, messages truncated
  // to 2 KB and stacks to 8 KB.
  const LOG_WINDOW_MS = 5_000;
  const LOG_MAX_PER_WINDOW = 20;
  const LOG_MAX_MESSAGE = 2_000;
  const LOG_MAX_STACK = 8_000;
  let logWindowStart = 0;
  let logWindowCount = 0;
  let logSuppressed = 0;

  function truncate(s: string, max: number): string {
    return s.length > max ? s.slice(0, max) + `…[+${s.length - max}]` : s;
  }

  secureHandle('log:error', (_event, level: string, message: string, stack?: string) => {
    const now = Date.now();
    if (now - logWindowStart > LOG_WINDOW_MS) {
      if (logSuppressed > 0) {
        log.warn(`[renderer] suppressed ${logSuppressed} errors (rate-limit)`);
        logSuppressed = 0;
      }
      logWindowStart = now;
      logWindowCount = 0;
    }
    if (logWindowCount >= LOG_MAX_PER_WINDOW) {
      logSuppressed++;
      return;
    }
    logWindowCount++;
    const safeLevel = typeof level === 'string' ? level.slice(0, 40) : 'unknown';
    const safeMessage = typeof message === 'string' ? truncate(message, LOG_MAX_MESSAGE) : '';
    const safeStack = typeof stack === 'string' ? truncate(stack, LOG_MAX_STACK) : '';
    log.error(`[renderer:${safeLevel}]`, safeMessage, safeStack);
  });

  secureHandle('shell:openExternal', (_event, url: string) => {
    if (typeof url !== 'string' || !isAllowedExternalUrl(url)) {
      console.warn('[shell:openExternal] blocked disallowed URL:', url);
      return;
    }
    return shell.openExternal(url);
  });
}
