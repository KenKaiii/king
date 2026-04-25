import { useEffect } from 'react';
import { useImagesStore } from '@/stores/imagesStore';

/**
 * Thin wrapper around `useImagesStore` that mirrors the original local-
 * state hook API. The store lives outside the component tree, so the
 * gallery survives navigation away and back, and saves from other pages
 * (Clone, Create Ads) show up immediately when those stores call
 * `useImagesStore.getState().addImage(saved)`.
 */
export function useImages() {
  const images = useImagesStore((s) => s.images);
  const isLoading = useImagesStore((s) => s.isLoading);
  const isLoadingMore = useImagesStore((s) => s.isLoadingMore);
  const hasMore = useImagesStore((s) => s.hasMore);
  const error = useImagesStore((s) => s.error);
  const loadInitial = useImagesStore((s) => s.loadInitial);
  const loadMore = useImagesStore((s) => s.loadMore);
  const addImage = useImagesStore((s) => s.addImage);
  const deleteImage = useImagesStore((s) => s.deleteImage);
  const deleteImages = useImagesStore((s) => s.deleteImages);
  const downloadImage = useImagesStore((s) => s.downloadImage);

  // Lazy initial fetch. `loadInitial` is idempotent (early-returns once
  // `hasHydrated` is true) so this is safe to run on every mount.
  useEffect(() => {
    void loadInitial();
  }, [loadInitial]);

  return {
    images,
    isLoading,
    isLoadingMore,
    hasMore,
    error,
    loadMore,
    addImage,
    deleteImage,
    deleteImages,
    downloadImage,
  };
}
