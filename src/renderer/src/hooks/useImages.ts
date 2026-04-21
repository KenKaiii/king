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
    hasMore,
    error,
    loadMore,
    addImage,
    deleteImage,
    downloadImage,
  };
}
