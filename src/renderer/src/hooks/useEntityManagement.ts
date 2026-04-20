import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import type { EntityData } from '@/types/electron';

export type EntityType = 'characters' | 'products';

export interface UploadedImage {
  id: string;
  file?: File;
  preview: string;
  aspectRatio: number;
  fileKey: string;
  isExisting?: boolean;
}

interface UseEntityManagementOptions {
  entityType: EntityType;
}

interface UseEntityManagementReturn {
  entities: EntityData[];
  isLoading: boolean;
  isCreating: boolean;
  hasFetched: boolean;
  editingEntity: EntityData | null;
  deleteEntityId: string | null;
  fetchEntities: () => Promise<void>;
  handleCreate: (name: string, images: UploadedImage[], productType?: string) => Promise<void>;
  handleSaveEdit: (
    id: string,
    name: string,
    images: UploadedImage[],
    productType?: string,
  ) => Promise<void>;
  handleDelete: (id: string) => void;
  confirmDelete: () => Promise<void>;
  cancelDelete: () => void;
  setEditingEntity: (entity: EntityData | null) => void;
}

export function useEntityManagement({
  entityType,
}: UseEntityManagementOptions): UseEntityManagementReturn {
  const [entities, setEntities] = useState<EntityData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasFetched, setHasFetched] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [editingEntity, setEditingEntity] = useState<EntityData | null>(null);
  const [deleteEntityId, setDeleteEntityId] = useState<string | null>(null);

  const fetchEntities = useCallback(async () => {
    try {
      const data = await window.api.entities.list(entityType);
      setEntities(data);
    } catch {
      // Silently fail - entities will show empty state
    } finally {
      setIsLoading(false);
      setHasFetched(true);
    }
  }, [entityType]);

  useEffect(() => {
    fetchEntities();
  }, [fetchEntities]);

  const handleCreate = useCallback(
    async (name: string, images: UploadedImage[], productType?: string) => {
      const trimmed = name.trim().toLowerCase();
      const isDuplicate = entities.some((e) => e.name.trim().toLowerCase() === trimmed);
      if (isDuplicate) {
        const label = entityType === 'products' ? 'product' : 'character';
        toast.error(`A ${label} named "${name.trim()}" already exists`);
        throw new Error('Duplicate name');
      }

      setIsCreating(true);
      try {
        const files = await Promise.all(
          images
            .filter((img) => img.file)
            .map(async (img) => ({
              name: img.file!.name,
              buffer: await img.file!.arrayBuffer(),
            })),
        );

        await window.api.entities.create(entityType, { name, files, productType });
        await fetchEntities();
      } catch {
        toast.error(`Failed to create ${entityType.slice(0, -1)}. Please try again.`);
        throw new Error(`Failed to create ${entityType.slice(0, -1)}`);
      } finally {
        setIsCreating(false);
      }
    },
    [entityType, fetchEntities, entities],
  );

  const handleSaveEdit = useCallback(
    async (id: string, name: string, images: UploadedImage[], productType?: string) => {
      const trimmed = name.trim().toLowerCase();
      const isDuplicate = entities.some(
        (e) => e.id !== id && e.name.trim().toLowerCase() === trimmed,
      );
      if (isDuplicate) {
        const label = entityType === 'products' ? 'product' : 'character';
        toast.error(`A ${label} named "${name.trim()}" already exists`);
        throw new Error('Duplicate name');
      }

      setIsCreating(true);
      try {
        const existingImages = images.filter((img) => img.isExisting).map((img) => img.preview);
        const newFiles = images.filter((img) => !img.isExisting && img.file);

        const newFileBuffers = await Promise.all(
          newFiles.map(async (img) => ({
            name: img.file!.name,
            buffer: await img.file!.arrayBuffer(),
          })),
        );

        await window.api.entities.update(entityType, id, {
          name,
          existingImages,
          newFiles: newFileBuffers,
          productType,
        });

        await fetchEntities();
        setEditingEntity(null);
      } catch {
        toast.error(`Failed to update ${entityType.slice(0, -1)}. Please try again.`);
        throw new Error(`Failed to update ${entityType.slice(0, -1)}`);
      } finally {
        setIsCreating(false);
      }
    },
    [entityType, fetchEntities, entities],
  );

  const handleDelete = useCallback((id: string) => {
    setDeleteEntityId(id);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!deleteEntityId) return;
    try {
      const result = await window.api.entities.delete(entityType, deleteEntityId);
      if (result.success) {
        setEntities((prev) => prev.filter((e) => e.id !== deleteEntityId));
      }
    } catch {
      // Silently fail - user can retry
    } finally {
      setDeleteEntityId(null);
    }
  }, [deleteEntityId, entityType]);

  const cancelDelete = useCallback(() => {
    setDeleteEntityId(null);
  }, []);

  return {
    entities,
    isLoading,
    isCreating,
    hasFetched,
    editingEntity,
    deleteEntityId,
    fetchEntities,
    handleCreate,
    handleSaveEdit,
    handleDelete,
    confirmDelete,
    cancelDelete,
    setEditingEntity,
  };
}
