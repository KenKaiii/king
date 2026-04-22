import { useState, useCallback, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import { CloseIcon, DeleteIcon } from '@/components/icons';
import ImagePromptForm from '@/components/ImagePromptForm';
import {
  ImageEmptyState,
  ImageDetailOverlay,
  VirtualizedImageGrid,
  type GeneratedImage,
} from '@/components/image';
import DeleteConfirmationModal from '@/components/ui/DeleteConfirmationModal';
import { useImages } from '@/hooks';
import { useGenerationStore } from '@/stores/generationStore';

interface ImagePageProps {
  prefillPrompt?: string | null;
  onPromptConsumed?: () => void;
}

export default function ImagePage({ prefillPrompt, onPromptConsumed }: ImagePageProps) {
  const { pendingImageGenerations, addImageGeneration, removeImageGeneration } =
    useGenerationStore();
  const pendingCount = pendingImageGenerations.length;

  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);
  const [recreateData, setRecreateData] = useState<{ prompt: string } | null>(null);
  const [editData, setEditData] = useState<{ imageUrl: string } | null>(null);

  // Handle prefilled prompt from Prompts page
  useEffect(() => {
    if (prefillPrompt) {
      setRecreateData({ prompt: prefillPrompt });
      onPromptConsumed?.();
    }
  }, [prefillPrompt, onPromptConsumed]);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const {
    images: generatedImages,
    isLoading,
    isLoadingMore,
    hasMore,
    loadMore: loadMoreImages,
    addImage,
    deleteImage,
    deleteImages,
    downloadImage: handleDownload,
  } = useImages();

  const [batchDeleteOpen, setBatchDeleteOpen] = useState(false);
  const selectedCount = selectedImages.size;

  const clearSelection = useCallback(() => setSelectedImages(new Set()), []);

  const handleBatchDeleteClick = useCallback(() => {
    if (selectedCount === 0) return;
    setBatchDeleteOpen(true);
  }, [selectedCount]);

  const confirmBatchDelete = useCallback(async () => {
    const ids = Array.from(selectedImages);
    setBatchDeleteOpen(false);
    setSelectedImages(new Set());
    await deleteImages(ids);
  }, [selectedImages, deleteImages]);

  const batchDeleteMessage = useMemo(
    () =>
      `Are you sure you want to delete ${selectedCount} image${
        selectedCount === 1 ? '' : 's'
      }? This action cannot be undone.`,
    [selectedCount],
  );

  const toggleSelectImage = useCallback((id: string) => {
    setSelectedImages((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteConfirmId) return;
    const id = deleteConfirmId;
    setDeleteConfirmId(null);

    setSelectedImages((prev) => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });

    await deleteImage(id);
  }, [deleteConfirmId, deleteImage]);

  const handleDelete = useCallback((id: string) => {
    setDeleteConfirmId(id);
  }, []);

  const handleImageClick = useCallback((img: GeneratedImage) => {
    setSelectedImage(img);
  }, []);

  const handleEdit = useCallback((imageUrl: string) => {
    setEditData({ imageUrl });
  }, []);

  const handleGenerate = (data: {
    prompt: string;
    model: string;
    count: number;
    aspectRatio: string;
    resolution: string;
    outputFormat: string;
    referenceImages: string[];
  }) => {
    const generationIds: string[] = [];
    for (let i = 0; i < data.count; i++) {
      const id = `img-${Date.now()}-${i}`;
      generationIds.push(id);
      addImageGeneration(id, data.prompt);
    }

    const generateImages = async () => {
      let successCount = 0;

      for (let i = 0; i < data.count; i++) {
        const generationId = generationIds[i];
        try {
          const result = await window.api.generate.image({
            prompt: data.prompt,
            aspectRatio: data.aspectRatio,
            resolution: data.resolution,
            outputFormat: data.outputFormat,
            imageUrls: data.referenceImages,
          });

          if (!result.success || !result.resultUrls?.length) {
            toast.error("Couldn't generate that image. Please try again.");
            removeImageGeneration(generationId);
            continue;
          }

          for (const url of result.resultUrls) {
            const savedImage = await window.api.images.save({
              url,
              prompt: data.prompt,
              aspectRatio: data.aspectRatio,
            });

            addImage(savedImage);
            successCount++;
          }

          removeImageGeneration(generationId);
        } catch (err) {
          toast.error(
            err instanceof Error ? err.message : 'Something went wrong. Please try again.',
          );
          removeImageGeneration(generationId);
        }
      }

      if (successCount > 0) {
        toast.success(`Generated ${successCount} image${successCount > 1 ? 's' : ''}.`);
      }
    };

    generateImages().catch((error) => {
      console.error('Unhandled error in image generation:', error);
      toast.error('Something went wrong. Please try again.');
      generationIds.forEach((id) => removeImageGeneration(id));
    });
  };

  return (
    <>
      <div className="relative min-h-0 flex-1 px-4 pt-4">
        {/* Selection toolbar — slides down from the top-right of the image
            grid whenever at least one image is selected. Contains a count,
            a delete action, and a clear-selection button. */}
        <div
          aria-hidden={selectedCount === 0}
          className={`absolute top-4 right-4 z-20 transition-all duration-200 ease-out ${
            selectedCount > 0
              ? 'translate-y-0 opacity-100'
              : 'pointer-events-none -translate-y-3 opacity-0'
          }`}
        >
          <div className="flex items-center gap-2 rounded-full border border-[var(--base-color-brand--umber)]/30 bg-[var(--base-color-brand--champagne)] py-1.5 pr-1.5 pl-4 shadow-[0_8px_24px_-12px_rgba(51,32,26,0.35)]">
            <span
              className="text-xs font-semibold tracking-wide text-[var(--base-color-brand--bean)]"
              style={{ fontFamily: 'var(--text-color--font-family--heading)' }}
            >
              {selectedCount} selected
            </span>
            <button
              type="button"
              onClick={handleBatchDeleteClick}
              className="btn-cinamon btn-sm"
              title="Delete selected"
            >
              <DeleteIcon />
              Delete
            </button>
            <button
              type="button"
              onClick={clearSelection}
              className="grid h-7 w-7 place-items-center rounded-full text-[var(--base-color-brand--umber)] transition-colors hover:bg-[var(--base-color-brand--shell)] hover:text-[var(--base-color-brand--bean)]"
              title="Clear selection"
              aria-label="Clear selection"
            >
              <CloseIcon />
            </button>
          </div>
        </div>

        <div className="h-full">
          {isLoading ? (
            <div className="flex h-full w-full items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <div className="size-8 animate-spin rounded-full border-2 border-[var(--base-color-brand--umber)]/30 border-t-[var(--base-color-brand--bean)]" />
                <span className="text-sm text-[var(--base-color-brand--umber)]">
                  Loading images...
                </span>
              </div>
            </div>
          ) : generatedImages.length > 0 || pendingCount > 0 ? (
            <VirtualizedImageGrid
              images={generatedImages}
              selectedImages={selectedImages}
              onSelect={toggleSelectImage}
              onClick={handleImageClick}
              onDownload={handleDownload}
              onDelete={handleDelete}
              onEdit={handleEdit}
              onLoadMore={loadMoreImages}
              hasMore={hasMore}
              isLoadingMore={isLoadingMore}
              pendingCount={pendingCount}
            />
          ) : (
            <ImageEmptyState />
          )}
        </div>
      </div>

      <ImagePromptForm onSubmit={handleGenerate} recreateData={recreateData} editData={editData} />

      {selectedImage && (
        <ImageDetailOverlay
          image={selectedImage}
          onClose={() => setSelectedImage(null)}
          onDelete={(id) => {
            handleDelete(id);
            setSelectedImage(null);
          }}
          onDownload={handleDownload}
          onRecreate={(prompt) => {
            setRecreateData({ prompt });
            setSelectedImage(null);
          }}
        />
      )}

      <DeleteConfirmationModal
        isOpen={deleteConfirmId !== null}
        title="Delete Image"
        message="Are you sure you want to delete this image? This action cannot be undone."
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteConfirmId(null)}
      />

      <DeleteConfirmationModal
        isOpen={batchDeleteOpen}
        title={`Delete ${selectedCount} image${selectedCount === 1 ? '' : 's'}`}
        message={batchDeleteMessage}
        onConfirm={confirmBatchDelete}
        onCancel={() => setBatchDeleteOpen(false)}
      />
    </>
  );
}
