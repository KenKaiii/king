import { useState } from 'react';
import UploadModal from './UploadModal';
import UploadReviewModal from './UploadReviewModal';
import EntityCard from './EntityCard';
import DeleteConfirmationModal from '@/components/ui/DeleteConfirmationModal';
import { useEntityManagement } from '@/hooks/useEntityManagement';
import type { UploadedImage, EntityType } from '@/hooks/useEntityManagement';
import type { EntityData } from '@/types/electron';
import type { PageType } from '@/App';
import { SparkleIcon } from '@/components/icons';

interface EntityManagementPageProps {
  entityType: EntityType;
  title: string;
  subtitle: string;
  createLabel: string;
  deleteTitle: string;
  deleteMessage: string;
  onNavigate: (page: PageType) => void;
}

export default function EntityManagementPage({
  entityType,
  title,
  subtitle,
  createLabel,
  deleteTitle,
  deleteMessage,
  onNavigate,
}: EntityManagementPageProps) {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const {
    entities,
    isLoading,
    isCreating,
    hasFetched,
    editingEntity,
    deleteEntityId,
    handleCreate,
    handleSaveEdit,
    handleDelete,
    confirmDelete,
    cancelDelete,
    setEditingEntity,
  } = useEntityManagement({ entityType });

  const handleFilesSelected = (files: File[]) => {
    setUploadedFiles(files);
    setIsUploadModalOpen(false);
    setIsReviewModalOpen(true);
  };

  const handleSave = async (name: string, images: UploadedImage[], productType?: string) => {
    try {
      await handleCreate(name, images, productType);
      setIsReviewModalOpen(false);
      setUploadedFiles([]);
    } catch {
      // Error already handled in hook
    }
  };

  const handleReviewModalClose = () => {
    setIsReviewModalOpen(false);
    setUploadedFiles([]);
    setEditingEntity(null);
  };

  const handleEditEntity = (entity: EntityData) => {
    setEditingEntity(entity);
    setIsReviewModalOpen(true);
  };

  const handleSaveEditWrapper = async (
    id: string,
    name: string,
    images: UploadedImage[],
    productType?: string,
  ) => {
    try {
      await handleSaveEdit(id, name, images, productType);
      setIsReviewModalOpen(false);
    } catch {
      // Error already handled in hook
    }
  };

  const handleGenerateWithEntity = (_entityId: string) => {
    onNavigate('image');
  };

  return (
    <>
      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onFilesSelected={handleFilesSelected}
        entityType={entityType}
      />
      <UploadReviewModal
        isOpen={isReviewModalOpen}
        onClose={handleReviewModalClose}
        initialFiles={uploadedFiles}
        entityType={entityType}
        onGenerate={handleSave}
        editEntity={editingEntity}
        onSaveEdit={handleSaveEditWrapper}
        isLoading={isCreating}
      />
      <DeleteConfirmationModal
        isOpen={!!deleteEntityId}
        title={deleteTitle}
        message={deleteMessage}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />

      <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6">
        {/* Title Section */}
        <div className="text-center">
          <h1
            className="text-3xl font-bold tracking-tight text-[var(--base-color-brand--bean)] sm:text-4xl"
            style={{ fontFamily: 'var(--text-color--font-family--heading)' }}
          >
            {title}
          </h1>
          <p className="mt-2 text-sm text-[var(--base-color-brand--umber)]">{subtitle}</p>
        </div>

        {/* CTA Button */}
        <button
          onClick={() => setIsUploadModalOpen(true)}
          disabled={isCreating}
          className="btn-cinamon mb-4"
        >
          <SparkleIcon className="size-5" />
          {isCreating ? 'Creating...' : createLabel}
        </button>

        {/* Content Grid */}
        <div className="relative grid w-full [&>*]:col-start-1 [&>*]:row-start-1">
          {/* Saved Entities */}
          <div
            className={`flex w-full flex-wrap justify-center gap-4 transition-opacity duration-200 ${
              entities.length > 0 ? 'opacity-100' : 'pointer-events-none opacity-0'
            }`}
          >
            {entities.map((entity) => (
              <EntityCard
                key={entity.id}
                entity={entity}
                onGenerate={handleGenerateWithEntity}
                onEdit={handleEditEntity}
                onDelete={handleDelete}
              />
            ))}
          </div>

          {/* Empty State */}
          <div
            className={`flex w-full justify-center transition-opacity duration-200 ${
              hasFetched && !isLoading && entities.length === 0
                ? 'opacity-100'
                : 'pointer-events-none opacity-0'
            }`}
          >
            <p className="text-sm text-[var(--base-color-brand--umber)]">
              No {entityType} yet. Create one to get started.
            </p>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center gap-3">
            <div className="size-6 animate-spin rounded-full border-2 border-[var(--base-color-brand--umber)]/30 border-t-[var(--base-color-brand--bean)]" />
            <span className="text-sm text-[var(--base-color-brand--umber)]">Loading...</span>
          </div>
        )}
      </main>
    </>
  );
}
