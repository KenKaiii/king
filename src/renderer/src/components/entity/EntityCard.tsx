import { memo, useCallback, useMemo, useState } from 'react';
import { SparkleIcon, EditIcon, DeleteIcon } from '@/components/icons';
import Badge from '@/components/ui/Badge';
import { productTypes } from '@/lib/productTypes';
import type { EntityData } from '@/types/electron';

const productTypeLabels: Record<string, string> = Object.fromEntries(
  productTypes.map((pt) => [pt.id, pt.label]),
);

interface EntityCardProps {
  entity: EntityData;
  onGenerate: (id: string) => void;
  onEdit: (entity: EntityData) => void;
  onDelete: (id: string) => void;
}

export default memo(function EntityCard({ entity, onGenerate, onEdit, onDelete }: EntityCardProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  const handleGenerate = useCallback(() => onGenerate(entity.id), [onGenerate, entity.id]);
  const handleEdit = useCallback(() => onEdit(entity), [onEdit, entity]);
  const handleDelete = useCallback(() => onDelete(entity.id), [onDelete, entity.id]);

  const productTypeLabel = useMemo(
    () => (entity.productType ? (productTypeLabels[entity.productType] ?? null) : null),
    [entity.productType],
  );

  return (
    <div className="group relative flex-shrink-0" style={{ contain: 'layout style' }}>
      <div className="relative h-72 w-48 overflow-hidden rounded-2xl border border-[var(--base-color-brand--umber)]/30 bg-[var(--base-color-brand--champagne)]">
        {entity.thumbnailUrl ? (
          <>
            {!isLoaded && <div className="skeleton-loader absolute inset-0" />}
            <img
              src={entity.thumbnailUrl}
              alt={entity.name}
              className={`h-full w-full object-cover transition-[filter,opacity] duration-200 ease-out group-hover:brightness-50 ${
                isLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={() => setIsLoaded(true)}
            />
          </>
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[var(--base-color-brand--umber)]">
            No image
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-[var(--base-color-brand--bean)]/50 opacity-0 transition-opacity duration-200 ease-out group-hover:opacity-100" />

        {/* Generate button */}
        <button
          type="button"
          onClick={handleGenerate}
          className="absolute top-1/2 left-1/2 inline-grid h-12 -translate-x-1/2 -translate-y-1/2 grid-flow-col items-center justify-center gap-2 rounded-full border-none bg-[var(--base-color-brand--cinamon)] px-5 text-sm font-semibold uppercase tracking-wide text-[var(--base-color-brand--shell)] opacity-0 shadow-[0_3px_0_0_var(--base-color-brand--dark-red)] transition-opacity duration-200 ease-out group-hover:opacity-100 hover:bg-[var(--base-color-brand--red)]"
          style={{ fontFamily: 'var(--text-color--font-family--heading)' }}
        >
          <SparkleIcon className="size-5" />
          Generate
        </button>

        {/* Top-left product type badge */}
        {productTypeLabel && (
          <div className="absolute top-2 left-2 z-20">
            <Badge>{productTypeLabel}</Badge>
          </div>
        )}

        {/* Top-right action buttons */}
        <div className="absolute top-2 right-2 z-20 flex gap-1 opacity-0 transition-opacity duration-200 ease-out group-hover:opacity-100">
          <button
            onClick={handleEdit}
            className="grid h-8 w-8 items-center justify-center rounded-full bg-[var(--base-color-brand--bean)]/80 text-[var(--base-color-brand--shell)] backdrop-blur-sm transition-colors hover:bg-[var(--base-color-brand--bean)]"
            title={`Edit ${entity.name}`}
          >
            <EditIcon />
          </button>
          <button
            onClick={handleDelete}
            className="grid h-8 w-8 items-center justify-center rounded-full bg-[var(--base-color-brand--bean)]/80 text-[var(--base-color-brand--shell)] backdrop-blur-sm transition-colors hover:bg-[var(--base-color-brand--dark-red)]"
            title={`Delete ${entity.name}`}
          >
            <DeleteIcon />
          </button>
        </div>

        {/* Bottom info gradient */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[var(--base-color-brand--bean)]/90 to-transparent p-3">
          <p
            className="truncate text-xs font-bold tracking-wide text-[var(--base-color-brand--shell)] uppercase"
            style={{ fontFamily: 'var(--text-color--font-family--heading)' }}
          >
            {entity.name}
          </p>
          <p className="text-xs text-[var(--base-color-brand--shell)]/80">
            {entity.referenceImages.length} images
          </p>
        </div>
      </div>
    </div>
  );
});
