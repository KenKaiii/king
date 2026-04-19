import { useEffect, useState, useCallback } from 'react';
import ImageDetailPanel from '../ImageDetailPanel';
import type { GeneratedImage } from './types';

interface ImageDetailOverlayProps {
  image: GeneratedImage;
  onClose: () => void;
  onDelete: (id: string) => void;
  onDownload: (url: string, prompt: string) => void;
  onRecreate: (prompt: string) => void;
}

export default function ImageDetailOverlay({
  image,
  onClose,
  onDelete,
  onDownload,
  onRecreate,
}: ImageDetailOverlayProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleClose = useCallback(() => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  }, [onClose]);

  const handleBackgroundClick = useCallback(() => {
    if (isExpanded) {
      setIsExpanded(false);
    } else {
      handleClose();
    }
  }, [isExpanded, handleClose]);

  const handleImageClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (isExpanded) {
        setIsExpanded(false);
      } else {
        setIsExpanded(true);
      }
    },
    [isExpanded],
  );

  useEffect(() => {
    requestAnimationFrame(() => {
      setIsVisible(true);
    });

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isExpanded) {
          setIsExpanded(false);
        } else {
          handleClose();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleClose, isExpanded]);

  return (
    <div
      className={`fixed inset-0 z-50 grid bg-[var(--base-color-brand--bean)]/80 backdrop-blur-sm transition-all duration-200 ease-out ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      style={{
        gridTemplateColumns: isExpanded ? '1fr 0px' : '1fr 380px',
        willChange: 'opacity',
      }}
    >
      {/* Image Preview */}
      <div
        className="flex h-full items-center justify-center p-8 select-none"
        onClick={handleBackgroundClick}
      >
        <div
          className={`relative h-full w-full transition-all duration-200 ease-out ${
            isExpanded ? 'max-w-6xl' : 'max-w-3xl'
          } ${isVisible ? 'opacity-100' : 'opacity-0'}`}
          onClick={handleImageClick}
          style={{
            pointerEvents: 'auto',
            cursor: isExpanded ? 'zoom-out' : 'zoom-in',
          }}
        >
          <img
            src={image.url}
            alt={image.prompt}
            loading="eager"
            className="pointer-events-none absolute inset-0 size-full rounded-xl object-contain"
          />
        </div>
      </div>

      {/* Detail Panel */}
      <div
        className={`h-full overflow-hidden transition-opacity duration-200 ease-out ${
          isVisible && !isExpanded ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ pointerEvents: isExpanded ? 'none' : 'auto' }}
      >
        <ImageDetailPanel
          image={image}
          onClose={handleClose}
          onDelete={onDelete}
          onDownload={onDownload}
          onRecreate={onRecreate}
        />
      </div>
    </div>
  );
}
