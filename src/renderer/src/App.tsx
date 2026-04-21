import { useState, useCallback } from 'react';
import Header from '@/components/layout/Header';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import ImagePage from '@/pages/ImagePage';
import CreateAdsPage from '@/pages/CreateAdsPage';
import ClonePage from '@/pages/ClonePage';
import ProductsPage from '@/pages/ProductsPage';
import CharactersPage from '@/pages/CharactersPage';
import FacebookAdsPage from '@/pages/FacebookAdsPage';
import GoogleAdsPage from '@/pages/GoogleAdsPage';
import TiktokShopPage from '@/pages/TiktokShopPage';
import ShopeeAdsPage from '@/pages/ShopeeAdsPage';
import StorePage from '@/pages/StorePage';
import ApisPage from '@/pages/ApisPage';
import PromptsPage from '@/pages/PromptsPage';

export type PageType =
  | 'image'
  | 'create-ads'
  | 'clone'
  | 'products'
  | 'characters'
  | 'facebook-ads'
  | 'google-ads'
  | 'tiktok-shop'
  | 'shopee-ads'
  | 'store'
  | 'apis'
  | 'prompts';

function AppContent() {
  const [currentPage, setCurrentPage] = useState<PageType>('image');
  const [prefillPrompt, setPrefillPrompt] = useState<string | null>(null);

  const handleUsePrompt = useCallback((promptText: string) => {
    setPrefillPrompt(promptText);
  }, []);

  const handlePromptConsumed = useCallback(() => {
    setPrefillPrompt(null);
  }, []);

  return (
    <div className="relative flex h-screen flex-col overflow-hidden">
      <Header currentPage={currentPage} onNavigate={setCurrentPage} />
      {currentPage === 'image' && (
        <ImagePage prefillPrompt={prefillPrompt} onPromptConsumed={handlePromptConsumed} />
      )}
      {currentPage === 'create-ads' && <CreateAdsPage />}
      {currentPage === 'clone' && <ClonePage />}
      {currentPage === 'products' && <ProductsPage onNavigate={setCurrentPage} />}
      {currentPage === 'characters' && <CharactersPage onNavigate={setCurrentPage} />}
      {currentPage === 'facebook-ads' && <FacebookAdsPage onNavigate={setCurrentPage} />}
      {currentPage === 'google-ads' && <GoogleAdsPage onNavigate={setCurrentPage} />}
      {currentPage === 'tiktok-shop' && <TiktokShopPage onNavigate={setCurrentPage} />}
      {currentPage === 'shopee-ads' && <ShopeeAdsPage onNavigate={setCurrentPage} />}
      {currentPage === 'store' && <StorePage />}
      {currentPage === 'apis' && <ApisPage />}
      {currentPage === 'prompts' && (
        <PromptsPage onNavigate={setCurrentPage} onUsePrompt={handleUsePrompt} />
      )}
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}
