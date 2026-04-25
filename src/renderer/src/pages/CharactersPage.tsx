import { EntityManagementPage } from '@/components/entity';
import type { PageType } from '@/App';

interface CharactersPageProps {
  onNavigate: (page: PageType) => void;
}

export default function CharactersPage({ onNavigate }: CharactersPageProps) {
  return (
    <EntityManagementPage
      entityType="characters"
      title="Characters"
      subtitle="Upload character photos to generate consistent character imagery"
      createLabel="Create Character"
      deleteTitle="Delete Character"
      deleteMessage="Are you sure you want to delete this character? All reference images will be removed. This action cannot be undone."
      onNavigate={onNavigate}
    />
  );
}
