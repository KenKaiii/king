import { EntityManagementPage } from '@/components/entity';
import type { PageType } from '@/App';

interface ProductsPageProps {
  onNavigate: (page: PageType) => void;
}

export default function ProductsPage({ onNavigate }: ProductsPageProps) {
  return (
    <EntityManagementPage
      entityType="products"
      title="Products"
      subtitle="Upload product photos to generate stunning product imagery"
      createLabel="Create Product"
      deleteTitle="Delete Product"
      deleteMessage="Are you sure you want to delete this product? All reference images will be removed. This action cannot be undone."
      onNavigate={onNavigate}
    />
  );
}
