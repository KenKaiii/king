import { useEffect } from 'react';
import { CheckIcon, CloseIcon, UploadIcon } from '@/components/icons';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFilesSelected: (files: File[]) => void;
  entityType: 'characters' | 'products';
}

export default function UploadModal({
  isOpen,
  onClose,
  onFilesSelected,
  entityType,
}: UploadModalProps) {
  const isProduct = entityType === 'products';

  const goodTitle = isProduct
    ? 'Upload clear product photos'
    : 'Upload 6-8 photos for best results';
  const goodDescription = isProduct
    ? 'Use clean backgrounds, good lighting, and show different angles of your product'
    : 'Upload high-quality images. Show different angles, clear facial expressions, and good lighting';
  const badTitle = 'Avoid These Types of Photos';
  const badDescription = isProduct
    ? 'No blurry images, cluttered backgrounds, multiple products, or poor lighting'
    : 'No duplicates, group shots, pets, nudes, filters, face-covering accessories, or masks';

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-[var(--base-color-brand--bean)]/70 backdrop-blur-sm transition-opacity duration-200 ${
        isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
      }`}
      style={{ willChange: 'opacity' }}
      onClick={onClose}
    >
      <div
        className={`mx-auto flex w-full max-w-lg flex-col gap-6 rounded-3xl border border-[var(--base-color-brand--umber)]/30 bg-[var(--base-color-brand--shell)] p-6 shadow-2xl transition-all duration-200 ${
          isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
        style={{ willChange: 'transform, opacity' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Good guidance */}
        <section className="flex gap-3">
          <div className="grid h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--base-color-brand--umber)]/40 bg-[var(--base-color-brand--dark-pink)] text-[var(--base-color-brand--bean)]">
            <CheckIcon className="h-4 w-4" />
          </div>
          <div>
            <p
              className="text-sm font-bold tracking-wide text-[var(--base-color-brand--bean)]"
              style={{ fontFamily: 'var(--text-color--font-family--heading)' }}
            >
              {goodTitle}
            </p>
            <p className="text-sm text-[var(--base-color-brand--umber)]">{goodDescription}</p>
          </div>
        </section>

        {/* Bad guidance */}
        <section className="flex gap-3">
          <div className="grid h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--base-color-brand--dark-red)]/30 bg-[var(--base-color-brand--light-pink)] text-[var(--base-color-brand--dark-red)]">
            <CloseIcon className="h-3.5 w-3.5" />
          </div>
          <div>
            <p
              className="text-sm font-bold tracking-wide text-[var(--base-color-brand--bean)]"
              style={{ fontFamily: 'var(--text-color--font-family--heading)' }}
            >
              {badTitle}
            </p>
            <p className="text-sm text-[var(--base-color-brand--umber)]">{badDescription}</p>
          </div>
        </section>

        {/* Upload Button */}
        <div className="flex justify-center">
          <label className="btn-cinamon cursor-pointer">
            <UploadIcon className="h-4 w-4" />
            Upload images
            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp,image/heic"
              multiple
              className="hidden"
              onChange={(e) => {
                const files = e.target.files;
                if (files && files.length > 0) {
                  onFilesSelected(Array.from(files));
                }
              }}
            />
          </label>
        </div>
      </div>
    </div>
  );
}
