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
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm transition-opacity duration-200 ${
        isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
      }`}
      style={{ willChange: 'opacity' }}
      onClick={onClose}
    >
      <div
        className={`mx-auto flex w-full max-w-lg flex-col gap-6 rounded-3xl border border-white/10 bg-black/60 p-6 backdrop-blur-xl transition-all duration-200 ${
          isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
        style={{ willChange: 'transform, opacity' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Good guidance */}
        <section className="flex gap-3">
          <div className="grid h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-pink-400/20 bg-pink-400/10 text-pink-400">
            <CheckIcon className="h-4 w-4 text-pink-400" />
          </div>
          <div>
            <p className="text-sm font-bold tracking-wide text-white uppercase">{goodTitle}</p>
            <p className="text-sm text-zinc-300">{goodDescription}</p>
          </div>
        </section>

        {/* Bad guidance */}
        <section className="flex gap-3">
          <div className="grid h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-red-500/20 bg-red-500/10 text-red-500">
            <CloseIcon className="h-3.5 w-3.5" />
          </div>
          <div>
            <p className="text-sm font-bold tracking-wide text-white uppercase">{badTitle}</p>
            <p className="text-sm text-zinc-300">{badDescription}</p>
          </div>
        </section>

        {/* Upload Button */}
        <div className="flex justify-center">
          <label className="inline-grid h-12 cursor-pointer grid-flow-col items-center justify-center gap-2 rounded-xl bg-pink-400 px-6 font-medium text-black transition-all duration-300 hover:bg-pink-500">
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
