import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import type { GeneratedImage } from '@/components/image';

const PAGE_SIZE = 18;

export function useImages() {
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [error, setError] = useState<Error | null>(null);

  // Initial load
  useEffect(() => {
    const loadInitial = async () => {
      try {
        setIsLoading(true);
        const result = await window.api.images.list(undefined, PAGE_SIZE);
        setImages(result.data);
        setHasMore(result.hasMore);
        setCursor(result.nextCursor ?? undefined);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load images'));
      } finally {
        setIsLoading(false);
      }
    };
    loadInitial();
  }, []);

  // Load more
  const loadMore = useCallback(async () => {
    if (!hasMore || isLoadingMore || !cursor) return;
    try {
      setIsLoadingMore(true);
      const result = await window.api.images.list(cursor, PAGE_SIZE);
      setImages((prev) => [...prev, ...result.data]);
      setHasMore(result.hasMore);
      setCursor(result.nextCursor ?? undefined);
    } catch (err) {
      console.error('Failed to load more images:', err);
    } finally {
      setIsLoadingMore(false);
    }
  }, [hasMore, isLoadingMore, cursor]);

  // Add new image (optimistic)
  const addImage = useCallback((image: GeneratedImage) => {
    setImages((prev) => [image, ...prev]);
  }, []);

  // Delete image
  const deleteImage = useCallback(async (id: string) => {
    // Optimistic update
    setImages((prev) => prev.filter((img) => img.id !== id));

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
  }, []);

  // Batch delete — removes every image in `ids` with a single summary
  // toast instead of one toast per deletion. Used by the selection
  // toolbar on the Image page.
  const deleteImages = useCallback(async (ids: string[]) => {
    if (ids.length === 0) return;

    // Optimistic update — drop them all from the grid up-front.
    const idSet = new Set(ids);
    setImages((prev) => prev.filter((img) => !idSet.has(img.id)));

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
  }, []);

  // Download image
  const downloadImage = useCallback(async (url: string, prompt: string) => {
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
  }, []);

  return {
    images,
    isLoading,
    isLoadingMore,
    deleteImages,
    hasMore,
    error,
    loadMore,
    addImage,
    deleteImage,
    downloadImage,
  };
}
