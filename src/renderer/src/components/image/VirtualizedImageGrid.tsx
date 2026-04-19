import { memo, useCallback, useEffect, useMemo, useRef, useState, forwardRef } from 'react';
import type { GridComponents, GridItemContent, ListRange } from 'react-virtuoso';
import { VirtuosoGrid } from 'react-virtuoso';
import type { GeneratedImage } from './types';

/**
 * Smooth-load hook — always starts `isReady=false` on mount and pre-decodes
 * the image off-screen before flipping to `true`. This forces a real fade-in
 * every time the grid (re)mounts, even for URLs the browser has cached, since
 * a cached response still needs a fresh decode on the render thread.
 */
function useDecodedImage(src: string): boolean {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setIsReady(false);

    const loader = new Image();
    loader.src = src;
    const decodePromise = typeof loader.decode === 'function' ? loader.decode() : Promise.resolve();

    decodePromise
      .catch(() => {
        /* decode can fail — fall through to reveal anyway */
      })
      .finally(() => {
        if (cancelled) return;
        // Two rAFs: first commits the opacity:0 paint, second triggers the transition.
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            if (!cancelled) setIsReady(true);
          });
        });
      });

    return () => {
      cancelled = true;
    };
  }, [src]);

  return isReady;
}

const GridImageItem = memo(function GridImageItem({
  image,
  isSelected,
  onSelect,
  onClick,
  onDownload,
  onDelete,
  onEdit,
}: {
  image: GeneratedImage;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onClick: (image: GeneratedImage) => void;
  onDownload: (url: string, prompt: string) => void;
  onDelete: (id: string) => void;
  onEdit: (imageUrl: string) => void;
}) {
  const displayUrl = image.thumbnailUrl || image.url;
  const isReady = useDecodedImage(displayUrl);

  const handleClick = useCallback(() => onClick(image), [onClick, image]);
  const handleSelect = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onSelect(image.id);
    },
    [onSelect, image.id],
  );
  const handleEdit = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onEdit(image.url);
    },
    [onEdit, image.url],
  );
  const handleDownload = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onDownload(image.url, image.prompt);
    },
    [onDownload, image.url, image.prompt],
  );
  const handleDelete = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onDelete(image.id);
    },
    [onDelete, image.id],
  );

  return (
    <div
      className="group relative aspect-square cursor-pointer overflow-hidden border border-[var(--base-color-brand--umber)]/20 bg-[var(--base-color-brand--champagne)]"
      style={{ contain: 'layout style paint' }}
      onClick={handleClick}
    >
      <div
        aria-hidden
        className="skeleton-loader absolute inset-0 z-0"
        style={{
          opacity: isReady ? 0 : 1,
          transition: 'opacity 600ms cubic-bezier(0.4, 0, 0.2, 1)',
          willChange: 'opacity',
        }}
      />

      <img
        src={displayUrl}
        alt={image.prompt}
        loading="lazy"
        decoding="async"
        style={{
          opacity: isReady ? 1 : 0,
          transform: isReady ? 'scale(1)' : 'scale(1.015)',
          transition:
            'opacity 600ms cubic-bezier(0.4, 0, 0.2, 1), transform 700ms cubic-bezier(0.22, 1, 0.36, 1)',
          willChange: 'opacity, transform',
        }}
        className="absolute inset-0 size-full object-cover"
      />

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[var(--base-color-brand--bean)]/70 via-transparent to-transparent opacity-0 transition-opacity duration-150 group-hover:opacity-100" />

      <div className="absolute top-2 left-2 z-10 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
        <button
          type="button"
          role="checkbox"
          aria-checked={isSelected}
          onClick={handleSelect}
          className={`flex size-5 items-center justify-center rounded border-2 transition-colors ${
            isSelected
              ? 'border-[var(--base-color-brand--shell)] bg-[var(--base-color-brand--shell)] text-[var(--base-color-brand--bean)]'
              : 'border-[var(--base-color-brand--shell)]/80 bg-[var(--base-color-brand--bean)]/40 hover:border-[var(--base-color-brand--shell)] hover:bg-[var(--base-color-brand--bean)]/60'
          }`}
        >
          {isSelected && (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <path
                d="M20 6L9 17L4 12"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </button>
      </div>

      <div className="absolute top-2 right-2 z-10 flex gap-1.5 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
        <button
          onClick={handleEdit}
          className="flex size-8 items-center justify-center rounded-full bg-[var(--base-color-brand--bean)]/80 text-[var(--base-color-brand--shell)] transition-colors hover:bg-[var(--base-color-brand--cinamon)]"
          title="Edit"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path
              d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M18.5 2.50001C18.8978 2.10219 19.4374 1.87869 20 1.87869C20.5626 1.87869 21.1022 2.10219 21.5 2.50001C21.8978 2.89784 22.1213 3.4374 22.1213 4.00001C22.1213 4.56262 21.8978 5.10219 21.5 5.50001L12 15L8 16L9 12L18.5 2.50001Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <button
          onClick={handleDownload}
          className="flex size-8 items-center justify-center rounded-full bg-[var(--base-color-brand--bean)]/80 text-[var(--base-color-brand--shell)] transition-colors hover:bg-[var(--base-color-brand--bean)]"
          title="Download"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path
              d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M7 10L12 15L17 10"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M12 15V3"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <button
          onClick={handleDelete}
          className="flex size-8 items-center justify-center rounded-full bg-[var(--base-color-brand--bean)]/80 text-[var(--base-color-brand--shell)] transition-colors hover:bg-[var(--base-color-brand--dark-red)]"
          title="Delete"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path
              d="M3 6H5H21"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      <div className="pointer-events-none absolute right-0 bottom-0 left-0 p-3 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
        <p className="line-clamp-2 text-xs text-[var(--base-color-brand--shell)]/90">
          {image.prompt}
        </p>
      </div>
    </div>
  );
});

const GridList = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ style, children, ...props }, ref) => (
    <div
      ref={ref}
      {...props}
      className="grid-cols-2 sm:grid-cols-3 md:grid-cols-4"
      style={{
        display: 'grid',
        gap: '6px',
        ...style,
      }}
    >
      {children}
    </div>
  ),
);
GridList.displayName = 'GridList';

const GridItem = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ children, ...props }, ref) => (
    <div ref={ref} {...props} style={{ aspectRatio: '1/1' }}>
      {children}
    </div>
  ),
);
GridItem.displayName = 'GridItem';

const GridFooter = () => <div style={{ height: '12rem' }} />;

const gridComponents: GridComponents<GeneratedImage> = {
  List: GridList,
  Item: GridItem,
  Footer: GridFooter,
};

interface VirtualizedImageGridProps {
  images: GeneratedImage[];
  selectedImages: Set<string>;
  onSelect: (id: string) => void;
  onClick: (image: GeneratedImage) => void;
  onDownload: (url: string, prompt: string) => void;
  onDelete: (id: string) => void;
  onEdit: (imageUrl: string) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoadingMore?: boolean;
  pendingCount?: number;
}

export default function VirtualizedImageGrid({
  images,
  selectedImages,
  onSelect,
  onClick,
  onDownload,
  onDelete,
  onEdit,
  onLoadMore,
  hasMore,
  isLoadingMore,
  pendingCount = 0,
}: VirtualizedImageGridProps) {
  const rangeRef = useRef<ListRange>({ startIndex: 0, endIndex: 0 });

  const isSelected = useCallback((id: string) => selectedImages.has(id), [selectedImages]);

  const handleRangeChanged = useCallback(
    (range: ListRange) => {
      rangeRef.current = range;
      if (hasMore && !isLoadingMore && range.endIndex >= images.length - 6) {
        onLoadMore?.();
      }
    },
    [hasMore, isLoadingMore, images.length, onLoadMore],
  );

  type GridItemType = GeneratedImage & { isPending?: boolean };
  const combinedData = useMemo((): GridItemType[] => {
    const pendingPlaceholders: GridItemType[] = Array.from({
      length: pendingCount,
    }).map((_, i) => ({
      id: `pending-${i}`,
      url: '',
      prompt: '',
      aspectRatio: '1:1',
      createdAt: new Date().toISOString(),
      isPending: true,
    }));
    return [...pendingPlaceholders, ...images];
  }, [pendingCount, images]);

  const computeItemKey = useCallback((_index: number, item: GridItemType) => item.id, []);

  const combinedItemContent: GridItemContent<GridItemType, unknown> = useCallback(
    (_index: number, item: GridItemType) => {
      if (item.isPending) {
        return (
          <div className="size-full overflow-hidden border border-[var(--base-color-brand--umber)]/20 bg-[var(--base-color-brand--champagne)]">
            <div className="skeleton-loader size-full" />
          </div>
        );
      }
      return (
        <GridImageItem
          image={item}
          isSelected={isSelected(item.id)}
          onSelect={onSelect}
          onClick={onClick}
          onDownload={onDownload}
          onDelete={onDelete}
          onEdit={onEdit}
        />
      );
    },
    [isSelected, onSelect, onClick, onDownload, onDelete, onEdit],
  );

  return (
    <div className="flex h-full flex-col">
      <div className="min-h-0 flex-1">
        <VirtuosoGrid
          style={{ height: '100%' }}
          data={combinedData}
          components={gridComponents}
          itemContent={combinedItemContent}
          computeItemKey={computeItemKey}
          rangeChanged={handleRangeChanged}
          overscan={200}
        />
      </div>
      {isLoadingMore && (
        <div className="flex justify-center py-4">
          <div className="size-6 animate-spin rounded-full border-2 border-[var(--base-color-brand--umber)]/30 border-t-[var(--base-color-brand--bean)]" />
        </div>
      )}
    </div>
  );
}
