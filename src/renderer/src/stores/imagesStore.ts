import { create } from 'zustand';
import { toast } from 'sonner';
import type { GeneratedImage } from '@/components/image';

const PAGE_SIZE = 18;

/**
 * Global image gallery state. Lives outside any single component so that:
 *   - ImagePage's gallery survives navigation away and back without a refetch
 *   - Generations triggered from other pages (Clone, Create Ads) can push
 *     their saved image straight into the gallery via `addImage`, instead of
 *     waiting for ImagePage to remount and re-list from disk.
 *
 * The previous implementation kept this in a local `useImages()` hook
 * tied to ImagePage's lifecycle \u2014 which meant any save that completed
 * after the user navigated away (or that was issued from a different
 * page entirely) only became visible after a tab round-trip. Moving the
 * state to a zustand store fixes both cases.
 */
interface ImagesStore {
  images: GeneratedImage[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  cursor: string | undefined;
  hasHydrated: boolean;
  error: Error | null;

  /** Fetch the first page from disk. Idempotent \u2014 safe to call from useEffect. */
  loadInitial: () => Promise<void>;
  loadMore: () => Promise<void>;
  addImage: (image: GeneratedImage) => void;
  deleteImage: (id: string) => Promise<void>;
  deleteImages: (ids: string[]) => Promise<void>;
  downloadImage: (url: string, prompt: string) => Promise<void>;
}

export const useImagesStore = create<ImagesStore>()((set, get) => ({
  images: [],
  isLoading: true,
  isLoadingMore: false,
  hasMore: false,
  cursor: undefined,
  hasHydrated: false,
  error: null,

  loadInitial: async () => {
    // Already hydrated \u2014 no need to refetch on every ImagePage remount.
    // Saved images from any page are pushed in via `addImage` directly.
    if (get().hasHydrated) return;
    try {
      set({ isLoading: true, error: null });
      const result = await window.api.images.list(undefined, PAGE_SIZE);
      set({
        images: result.data,
        hasMore: result.hasMore,
        cursor: result.nextCursor ?? undefined,
        hasHydrated: true,
      });
    } catch (err) {
      set({ error: err instanceof Error ? err : new Error('Failed to load images') });
    } finally {
      set({ isLoading: false });
    }
  },

  loadMore: async () => {
    const { hasMore, isLoadingMore, cursor } = get();
    if (!hasMore || isLoadingMore || !cursor) return;
    try {
      set({ isLoadingMore: true });
      const result = await window.api.images.list(cursor, PAGE_SIZE);
      set((state) => ({
        images: [...state.images, ...result.data],
        hasMore: result.hasMore,
        cursor: result.nextCursor ?? undefined,
      }));
    } catch (err) {
      console.error('Failed to load more images:', err);
    } finally {
      set({ isLoadingMore: false });
    }
  },

  addImage: (image) => {
    set((state) => ({ images: [image, ...state.images] }));
  },

  deleteImage: async (id) => {
    // Optimistic remove.
    set((state) => ({ images: state.images.filter((img) => img.id !== id) }));
    try {
      const result = await window.api.images.delete(id);
      if (result.success) {
        toast.success('Image deleted.');
      } else {
        toast.error("Couldn't delete the image. Please try again.");
      }
    } catch {
      toast.error("Couldn't delete the image. Please try again.");
    }
  },

  deleteImages: async (ids) => {
    if (ids.length === 0) return;
    const idSet = new Set(ids);
    set((state) => ({ images: state.images.filter((img) => !idSet.has(img.id)) }));

    const results = await Promise.allSettled(ids.map((id) => window.api.images.delete(id)));
    const deleted = results.filter((r) => r.status === 'fulfilled' && r.value.success).length;
    const failed = ids.length - deleted;

    if (failed === 0) {
      toast.success(`Deleted ${deleted} image${deleted === 1 ? '' : 's'}.`);
    } else if (deleted === 0) {
      toast.error("Couldn't delete those images. Please try again.");
    } else {
      toast.success(`Deleted ${deleted} image${deleted === 1 ? '' : 's'} (${failed} failed).`);
    }
  },

  downloadImage: async (url, prompt) => {
    const filename = `${prompt.slice(0, 30).replace(/[^a-z0-9]/gi, '_')}_${Date.now()}.png`;
    try {
      const result = await window.api.files.download(url, filename);
      if (result.success) {
        toast.success('Image saved.');
      } else if (!result.cancelled) {
        toast.error("Couldn't save the image. Please try again.");
      }
    } catch {
      toast.error("Couldn't save the image. Please try again.");
    }
  },
}));
