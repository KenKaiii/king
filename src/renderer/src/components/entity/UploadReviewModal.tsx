import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { SparkleIcon, CloseIcon } from '@/components/icons';
import type { UploadedImage } from '@/hooks/useEntityManagement';
import type { EntityData } from '@/types/electron';

interface UploadReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialFiles: File[];
  onGenerate: (name: string, images: UploadedImage[]) => void;
  editEntity?: EntityData | null;
  onSaveEdit?: (id: string, name: string, images: UploadedImage[]) => void;
  isLoading?: boolean;
}

const MAX_IMAGES = 14;

const getFileKey = (file: File): string => `${file.name}-${file.size}`;

function getCountRating(count: number) {
  if (count < 4) {
    return {
      label: 'Too Few',
      color: 'text-[var(--base-color-brand--dark-red)]',
      gradientFrom: '#b82a57',
      gradientTo: '#d93a63',
    };
  } else if (count < 6) {
    return {
      label: 'Good',
      color: 'text-[var(--base-color-brand--umber)]',
      gradientFrom: '#ffcbd6',
      gradientTo: '#ffee8c',
    };
  } else {
    return {
      label: 'Excellent',
      color: 'text-[var(--base-color-brand--cinamon)]',
      gradientFrom: '#ff94ac',
      gradientTo: '#d93a63',
    };
  }
}

function getImageAspectRatio(src: string): Promise<number> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img.width / img.height);
    img.onerror = () => resolve(1);
    img.src = src;
  });
}

export default function UploadReviewModal({
  isOpen,
  onClose,
  initialFiles,
  onGenerate,
  editEntity,
  onSaveEdit,
  isLoading = false,
}: UploadReviewModalProps) {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [entityName, setEntityName] = useState('');
  const isEditMode = !!editEntity;

  // Load existing entity data in edit mode
  useEffect(() => {
    if (editEntity) {
      setEntityName(editEntity.name);
      const loadExistingImages = async () => {
        const existingImages: UploadedImage[] = await Promise.all(
          editEntity.referenceImages.map(async (url, index) => {
            const aspectRatio = await getImageAspectRatio(url);
            return {
              id: `existing-${index}`,
              preview: url,
              aspectRatio,
              fileKey: url,
              isExisting: true,
            };
          }),
        );
        setImages(existingImages);
      };
      loadExistingImages();
    }
  }, [editEntity]);

  // Convert initial files to uploadable images
  useEffect(() => {
    if (initialFiles.length > 0 && !isEditMode) {
      const loadImages = async () => {
        const seenKeys = new Set<string>();
        let duplicateCount = 0;
        const uniqueFiles = initialFiles.filter((file) => {
          const key = getFileKey(file);
          if (seenKeys.has(key)) {
            duplicateCount++;
            return false;
          }
          seenKeys.add(key);
          return true;
        });

        if (duplicateCount > 0) {
          toast.error(`${duplicateCount} duplicate image${duplicateCount > 1 ? 's' : ''} skipped`);
        }

        const newImages: UploadedImage[] = await Promise.all(
          uniqueFiles.map(async (file, index) => {
            const preview = URL.createObjectURL(file);
            const aspectRatio = await getImageAspectRatio(preview);
            return {
              id: `${Date.now()}-${index}`,
              file,
              preview,
              aspectRatio,
              fileKey: getFileKey(file),
            };
          }),
        );
        setImages(newImages);
      };
      loadImages();
    }

    return () => {
      // Cleanup blob URLs on unmount
      images.forEach((img) => {
        if (!img.isExisting && img.preview.startsWith('blob:')) {
          URL.revokeObjectURL(img.preview);
        }
      });
    };
  }, [initialFiles, isEditMode]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    } else if (!editEntity) {
      setEntityName('');
      setImages([]);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose, editEntity]);

  const handleAddMoreImages = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const existingKeys = new Set(
        images.filter((img) => !img.isExisting).map((img) => img.fileKey),
      );

      const seenKeys = new Set<string>();
      let duplicateCount = 0;
      const uniqueNewFiles = Array.from(files).filter((file) => {
        const key = getFileKey(file);
        if (existingKeys.has(key) || seenKeys.has(key)) {
          duplicateCount++;
          return false;
        }
        seenKeys.add(key);
        return true;
      });

      if (duplicateCount > 0) {
        toast.error(`${duplicateCount} duplicate image${duplicateCount > 1 ? 's' : ''} skipped`);
      }

      if (uniqueNewFiles.length > 0) {
        const newImages: UploadedImage[] = await Promise.all(
          uniqueNewFiles.map(async (file, index) => {
            const preview = URL.createObjectURL(file);
            const aspectRatio = await getImageAspectRatio(preview);
            return {
              id: `${Date.now()}-${index}`,
              file,
              preview,
              aspectRatio,
              fileKey: getFileKey(file),
            };
          }),
        );
        setImages((prev) => [...prev, ...newImages].slice(0, MAX_IMAGES));
      }
    }
    e.target.value = '';
  };

  const handleRemoveImage = (id: string) => {
    setImages((prev) => {
      const img = prev.find((i) => i.id === id);
      if (img && !img.isExisting && img.preview.startsWith('blob:')) {
        URL.revokeObjectURL(img.preview);
      }
      return prev.filter((i) => i.id !== id);
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (images.length === 0 || !entityName.trim() || isLoading) return;
    if (isEditMode && editEntity && onSaveEdit) {
      onSaveEdit(editEntity.id, entityName, images);
    } else {
      onGenerate(entityName, images);
    }
  };

  const imageCount = images.length;
  const countPercentage = Math.min((imageCount / MAX_IMAGES) * 100, 100);
  const countRating = getCountRating(imageCount);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 ${
        isOpen
          ? 'visible bg-[var(--base-color-brand--bean)]/70 opacity-100 backdrop-blur-sm'
          : 'invisible opacity-0'
      }`}
      onClick={onClose}
    >
      <div
        className={`mx-4 grid h-[90vh] max-h-[700px] w-full max-w-[68rem] grid-rows-[auto_1fr_auto] gap-4 rounded-3xl border border-[var(--base-color-brand--umber)]/30 bg-[var(--base-color-brand--shell)] shadow-2xl transition-all duration-300 ${
          isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Upload More Button */}
        <label className="grid w-full cursor-pointer rounded-t-3xl bg-[var(--base-color-brand--champagne)] p-3 text-center text-[var(--base-color-brand--umber)] transition hover:bg-[var(--base-color-brand--cream)]">
          <input
            multiple
            className="sr-only"
            accept="image/jpeg,image/jpg,image/png,image/webp,image/heic"
            type="file"
            onChange={handleAddMoreImages}
          />
          <div className="grid justify-center rounded-xl border border-dashed border-transparent p-5">
            <div className="flex items-center justify-center">
              <span className="inline-grid h-12 grid-flow-col items-center justify-center gap-1.5 rounded-full border border-[var(--base-color-brand--umber)]/50 bg-[var(--base-color-brand--shell)] px-4 text-sm font-semibold uppercase tracking-wide text-[var(--base-color-brand--bean)] transition hover:bg-[var(--base-color-brand--bean)] hover:text-[var(--base-color-brand--shell)]">
                <SparkleIcon className="size-5" />
                Upload images
              </span>
            </div>
          </div>
        </label>

        {/* Image Gallery */}
        <div className="grid grid-cols-2 gap-0 overflow-y-auto px-2 pt-1 pb-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {images.map((img, index) => (
            <div key={img.id} className="w-full">
              <div className="group relative p-2">
                <button
                  type="button"
                  onClick={() => handleRemoveImage(img.id)}
                  className="absolute -top-1 -right-1 z-10 grid h-6 w-6 items-center justify-center rounded-full border border-[var(--base-color-brand--umber)]/60 bg-[var(--base-color-brand--shell)] text-[var(--base-color-brand--bean)] transition hover:bg-[var(--base-color-brand--bean)] hover:text-[var(--base-color-brand--shell)] lg:opacity-0 lg:group-hover:opacity-100"
                >
                  <CloseIcon />
                </button>
                <figure
                  className="relative overflow-hidden rounded-lg"
                  style={{ aspectRatio: img.aspectRatio }}
                >
                  <img
                    alt={`uploaded file ${index}`}
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 h-full w-full object-cover"
                    src={img.preview}
                  />
                </figure>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Form */}
        <form
          onSubmit={handleSubmit}
          className="sticky bottom-4 z-10 grid grid-cols-12 grid-rows-[auto_4rem] gap-2 rounded-3xl border border-[var(--base-color-brand--umber)]/30 bg-[var(--base-color-brand--champagne)] p-3 md:bottom-8 lg:grid-rows-1"
        >
          {/* Stats Section */}
          <div className="col-span-12 flex items-center lg:col-span-7">
            <div className="w-full items-center rounded-2xl border border-[var(--base-color-brand--umber)]/30 bg-[var(--base-color-brand--shell)] px-3 py-3 md:px-4">
              <div className="grid grid-flow-row-dense auto-rows-min items-center md:grid-cols-[1fr_auto]">
                <p className="truncate text-xs text-[var(--base-color-brand--umber)] md:order-1 md:text-sm">
                  Images count
                </p>
                <div className="grid grid-cols-[auto_1fr] items-center gap-1 md:gap-3">
                  <p
                    className={`truncate text-[10px] font-bold tracking-wide uppercase md:text-xs ${countRating.color}`}
                  >
                    {countRating.label}
                  </p>
                  <p className="truncate text-xs text-[var(--base-color-brand--umber)] md:text-sm">
                    {imageCount} of {MAX_IMAGES}
                  </p>
                </div>
              </div>
              <div
                role="progressbar"
                className="relative mt-1 w-full rounded-full bg-[var(--base-color-brand--cream)] p-px md:p-1"
              >
                <div
                  className="h-1.5 rounded-full transition-all duration-300 md:h-3"
                  style={{
                    width: `${countPercentage}%`,
                    background: `linear-gradient(to right, ${countRating.gradientFrom}, ${countRating.gradientTo})`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Name Input and Save Button */}
          <div className="col-span-12 grid grid-cols-12 gap-2 lg:col-span-5">
            <label className="col-span-6 flex flex-col justify-center gap-1 rounded-2xl border border-[var(--base-color-brand--umber)]/30 bg-[var(--base-color-brand--shell)] px-3 lg:col-span-7">
              <span className="h-4 text-xs text-[var(--base-color-brand--umber)] md:text-sm">
                Enter name
              </span>
              <input
                required
                maxLength={30}
                placeholder="Type here..."
                className="h-5 w-full bg-transparent text-xs font-bold text-[var(--base-color-brand--bean)] outline-none placeholder:text-[var(--base-color-brand--umber)]/60 md:text-sm"
                type="text"
                value={entityName}
                onChange={(e) => setEntityName(e.target.value)}
                name="name"
              />
            </label>
            <div
              className={`relative col-span-6 lg:col-span-5 ${isLoading ? 'spinning-border' : ''}`}
            >
              <button
                type="submit"
                disabled={images.length === 0 || !entityName.trim() || isLoading}
                className={`relative z-10 inline-grid h-full w-full grid-flow-col items-center justify-center gap-2 rounded-full px-4 text-sm font-semibold uppercase tracking-wide transition-all duration-300 ${
                  isLoading
                    ? 'bg-[var(--base-color-brand--umber)] text-[var(--base-color-brand--shell)]'
                    : 'border-none bg-[var(--base-color-brand--cinamon)] text-[var(--base-color-brand--shell)] shadow-[0_3px_0_0_var(--base-color-brand--dark-red)] hover:bg-[var(--base-color-brand--red)] active:translate-y-0.5 active:shadow-[0_1px_0_0_var(--base-color-brand--dark-red)] disabled:cursor-not-allowed disabled:bg-[var(--base-color-brand--umber)] disabled:text-[var(--base-color-brand--shell)]/70 disabled:shadow-[0_3px_0_0_var(--base-color-brand--bean)]'
                }`}
                style={{ fontFamily: 'var(--text-color--font-family--heading)' }}
              >
                {isLoading ? (
                  <>
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Uploading...
                  </>
                ) : (
                  <>{isEditMode ? 'Save' : 'Save'}</>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
