/**
 * Global cache of loaded image URLs.
 * Persists across scrolling so images that have already loaded
 * don't show skeleton again.
 */

const STORAGE_KEY = 'loaded-images-cache';
const MAX_CACHE_SIZE = 500;

let loadedImages: Set<string> | null = null;

function getCache(): Set<string> {
  if (loadedImages !== null) return loadedImages;

  loadedImages = new Set<string>();

  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored) {
      const urls = JSON.parse(stored) as string[];
      urls.forEach((url) => loadedImages!.add(url));
    }
  } catch {
    // Ignore parse errors
  }

  return loadedImages;
}

let persistTimeout: ReturnType<typeof setTimeout> | null = null;

function persistCache(): void {
  if (persistTimeout) clearTimeout(persistTimeout);

  persistTimeout = setTimeout(() => {
    try {
      const cache = getCache();
      const urls = Array.from(cache);
      const toStore = urls.length > MAX_CACHE_SIZE ? urls.slice(-MAX_CACHE_SIZE) : urls;
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
    } catch {
      // Ignore storage errors
    }
  }, 100);
}

export function markImageLoaded(url: string): void {
  // `local-file://` URLs resolve to the user's own disk via our custom
  // protocol — they load synchronously for all intents and purposes, so
  // there is nothing to remember. Skipping the add keeps the cache (and
  // its 500-entry window) reserved for remote URLs that actually benefit
  // from skeleton suppression on revisit.
  if (url.startsWith('local-file://')) return;
  getCache().add(url);
  persistCache();
}

export function isImageLoaded(url: string): boolean {
  // Treat local-file:// as always-loaded so the grid skips its skeleton
  // fade-in on revisit. See `markImageLoaded` for the companion branch.
  if (url.startsWith('local-file://')) return true;
  return getCache().has(url);
}

export function clearImageCache(): void {
  getCache().clear();
  sessionStorage.removeItem(STORAGE_KEY);
}
