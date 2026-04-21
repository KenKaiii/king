import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
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
    downloadImage: handleDownload,
  } = useImages();

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
      <div className="min-h-0 flex-1 px-4 pt-4">
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
    </>
  );
}
