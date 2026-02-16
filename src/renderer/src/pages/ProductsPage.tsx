import { EntityManagementPage } from '@/components/entity';

interface ProductsPageProps {
  onNavigate: (page: string) => void;
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
