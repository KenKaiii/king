import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

// Mock sessionStorage before importing the module
const sessionStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: vi.fn((index: number) => Object.keys(store)[index] ?? null),
    _getStore: () => store,
  };
})();

vi.stubGlobal('sessionStorage', sessionStorageMock);

// Dynamic import so each test file gets a fresh module after mocking globals
let markImageLoaded: typeof import('@/lib/imageLoadedCache').markImageLoaded;
let isImageLoaded: typeof import('@/lib/imageLoadedCache').isImageLoaded;
let clearImageCache: typeof import('@/lib/imageLoadedCache').clearImageCache;

describe('imageLoadedCache', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    sessionStorageMock.clear();
    // Use vi.useFakeTimers to control setTimeout in persistCache
    vi.useFakeTimers();

    // Re-import fresh module for each test to reset the internal `loadedImages` Set
    vi.resetModules();
    const mod = await import('@/lib/imageLoadedCache');
    markImageLoaded = mod.markImageLoaded;
    isImageLoaded = mod.isImageLoaded;
    clearImageCache = mod.clearImageCache;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('isImageLoaded', () => {
    it('returns true for local-file:// URLs without caching', () => {
      expect(isImageLoaded('local-file:///path/to/image.jpg')).toBe(true);
      // Should not have written anything to sessionStorage
      expect(sessionStorageMock.setItem).not.toHaveBeenCalled();
    });

    it('returns false for an unknown URL', () => {
      expect(isImageLoaded('https://example.com/img.png')).toBe(false);
    });
  });

  describe('markImageLoaded + isImageLoaded round-trip', () => {
    it('marks an image as loaded and isImageLoaded returns true', () => {
      const url = 'https://example.com/photo.jpg';

      expect(isImageLoaded(url)).toBe(false);
      markImageLoaded(url);
      expect(isImageLoaded(url)).toBe(true);
    });

    it('persists to sessionStorage after the debounce timeout', () => {
      markImageLoaded('https://example.com/a.jpg');
      markImageLoaded('https://example.com/b.jpg');

      // Before the timeout fires, sessionStorage.setItem should not have been called for our key
      expect(sessionStorageMock.setItem).not.toHaveBeenCalled();

      // Advance timers past the 100ms debounce
      vi.advanceTimersByTime(150);

      expect(sessionStorageMock.setItem).toHaveBeenCalledWith(
        'loaded-images-cache',
        expect.any(String),
      );

      const stored = JSON.parse(
        sessionStorageMock.setItem.mock.calls[0][1],
      ) as string[];
      expect(stored).toContain('https://example.com/a.jpg');
      expect(stored).toContain('https://example.com/b.jpg');
    });
  });

  describe('clearImageCache', () => {
    it('resets the in-memory cache and removes the sessionStorage entry', () => {
      markImageLoaded('https://example.com/cached.jpg');
      expect(isImageLoaded('https://example.com/cached.jpg')).toBe(true);

      clearImageCache();

      expect(isImageLoaded('https://example.com/cached.jpg')).toBe(false);
      expect(sessionStorageMock.removeItem).toHaveBeenCalledWith(
        'loaded-images-cache',
      );
    });
  });

  describe('size limiting', () => {
    it('keeps only 500 items when persisting more than 500', () => {
      // Add 510 items to exceed MAX_CACHE_SIZE (500)
      for (let i = 0; i < 510; i++) {
        markImageLoaded(`https://example.com/img-${i}.jpg`);
      }

      // Flush the debounced persist
      vi.advanceTimersByTime(150);

      expect(sessionStorageMock.setItem).toHaveBeenCalled();

      const lastCall =
        sessionStorageMock.setItem.mock.calls[
          sessionStorageMock.setItem.mock.calls.length - 1
        ];
      const stored = JSON.parse(lastCall[1]) as string[];
      expect(stored).toHaveLength(500);

      // Should keep the last 500 items (slice(-500)), so img-10 through img-509
      expect(stored).toContain('https://example.com/img-509.jpg');
      expect(stored).toContain('https://example.com/img-10.jpg');
      expect(stored).not.toContain('https://example.com/img-0.jpg');
    });
  });

  describe('sessionStorage hydration', () => {
    it('loads previously stored URLs on first access', async () => {
      // Pre-populate sessionStorage before module loads
      sessionStorageMock.clear();
      vi.clearAllMocks();

      // Manually set stored data
      const preloaded = ['https://example.com/pre-1.jpg', 'https://example.com/pre-2.jpg'];
      sessionStorageMock.setItem('loaded-images-cache', JSON.stringify(preloaded));
      // Reset the mock call count so we only track new calls
      sessionStorageMock.setItem.mockClear();
      sessionStorageMock.getItem.mockClear();

      // Re-import fresh module to trigger hydration from sessionStorage
      vi.resetModules();
      const freshMod = await import('@/lib/imageLoadedCache');

      expect(freshMod.isImageLoaded('https://example.com/pre-1.jpg')).toBe(true);
      expect(freshMod.isImageLoaded('https://example.com/pre-2.jpg')).toBe(true);
      expect(freshMod.isImageLoaded('https://example.com/unknown.jpg')).toBe(false);
    });
  });
});
