import { create } from 'zustand';
import { toast } from 'sonner';
import {
  CREATE_ADS_GENERATION_COUNT,
  CREATE_ADS_OUTPUT_FORMAT,
  CREATE_ADS_RESOLUTION,
  buildCreateAdsPrompt,
} from '@/lib/constants/create-ads';
import { pickVariant, type AdReference } from '@/lib/adReferences';
import type { EntityData, GeneratedImageData } from '@/types/electron';

export type StepId = 'ad' | 'product' | 'brief' | 'format' | 'results';

export interface ResultSlot {
  id: string;
  status: 'pending' | 'success' | 'error';
  image?: GeneratedImageData;
  error?: string;
}

// Max product reference images to include with the generation. Nano Banana
// Pro accepts up to 14; 2 product angles is plenty for shape/label fidelity
// and keeps the IPC payload small.
const MAX_PRODUCT_REFERENCES = 2;

/**
 * Convert a bundled vite-served asset URL to a base64 data URL so it can be
 * passed through IPC to the main process (which only accepts data:, http:,
 * or local-file:// URLs).
 */
async function bundledAssetToDataUrl(assetUrl: string): Promise<string> {
  const response = await fetch(assetUrl);
  const blob = await response.blob();
  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error ?? new Error('Failed to read asset'));
    reader.readAsDataURL(blob);
  });
}

interface CreateAdsStore {
  // Wizard state — every field here persists across page navigation so a
  // user can leave and come back to exactly where they were.
  step: StepId;
  selectedAdId: string | null;
  selectedProductId: string | null;
  productBrief: string;
  aspectRatio: string;

  // Generation state. Lives in the store (not the component) so fal calls
  // started before navigation continue updating the slots after the user
  // returns to the page.
  results: ResultSlot[];
  isGenerating: boolean;

  setStep: (step: StepId) => void;
  setSelectedAdId: (id: string | null) => void;
  setSelectedProductId: (id: string | null) => void;
  setProductBrief: (brief: string) => void;
  setAspectRatio: (ratio: string) => void;
  removeResultByImageId: (imageId: string) => void;
  startNewAd: () => void;

  runGeneration: (ad: AdReference, product: EntityData) => Promise<void>;
}

const INITIAL_STATE = {
  step: 'ad' as StepId,
  selectedAdId: null,
  selectedProductId: null,
  productBrief: '',
  aspectRatio: '1:1',
  results: [] as ResultSlot[],
  isGenerating: false,
};

export const useCreateAdsStore = create<CreateAdsStore>((set, get) => ({
  ...INITIAL_STATE,

  setStep: (step) => set({ step }),
  setSelectedAdId: (selectedAdId) => set({ selectedAdId }),
  setSelectedProductId: (selectedProductId) => set({ selectedProductId }),
  setProductBrief: (productBrief) => set({ productBrief }),
  setAspectRatio: (aspectRatio) => set({ aspectRatio }),

  removeResultByImageId: (imageId) =>
    set((state) => ({
      results: state.results.filter((slot) => slot.image?.id !== imageId),
    })),

  // Clear any prior results and return to the first step — used by the
  // "Create another" button on the results screen.
  startNewAd: () => set({ ...INITIAL_STATE }),

  runGeneration: async (ad, product) => {
    const { productBrief, aspectRatio } = get();

    if (productBrief.trim().length === 0) {
      toast.error('Add a short description of your product first.');
      return;
    }

    // Immediately switch to the results step with empty pending slots so
    // the UI renders skeletons the instant the user clicks Generate.
    const slotIds = Array.from(
      { length: CREATE_ADS_GENERATION_COUNT },
      (_, i) => `ad-${Date.now()}-${i}`,
    );
    set({
      step: 'results',
      isGenerating: true,
      results: slotIds.map((id) => ({ id, status: 'pending' })),
    });

    // Pick the variant of the selected ad that best matches the user's
    // chosen output aspect ratio (falls back to the ad's default variant).
    const variant = pickVariant(ad, aspectRatio);

    let adDataUrl: string;
    try {
      adDataUrl = await bundledAssetToDataUrl(variant.imageUrl);
    } catch {
      toast.error("Couldn't load the reference ad. Please try again.");
      set({ isGenerating: false, results: [], step: 'format' });
      return;
    }

    const productUrls = product.referenceImages.slice(0, MAX_PRODUCT_REFERENCES);
    if (productUrls.length === 0) {
      toast.error('This product has no images yet. Add at least one on the Products page.');
      set({ isGenerating: false, results: [], step: 'format' });
      return;
    }

    const prompt = buildCreateAdsPrompt(productBrief, aspectRatio);
    const imageUrls = [adDataUrl, ...productUrls];

    const updateSlot = (slotId: string, update: Partial<ResultSlot>) =>
      set((state) => ({
        results: state.results.map((s) => (s.id === slotId ? { ...s, ...update } : s)),
      }));

    // Fire all N generations in parallel. Each slot updates independently
    // so results stream in as they complete — including across navigation
    // back to the page, since the store outlives the component.
    await Promise.all(
      slotIds.map(async (slotId) => {
        try {
          const result = await window.api.generate.image({
            prompt,
            aspectRatio,
            resolution: CREATE_ADS_RESOLUTION,
            outputFormat: CREATE_ADS_OUTPUT_FORMAT,
            imageUrls,
          });

          if (!result.success || !result.resultUrls?.length) {
            updateSlot(slotId, { status: 'error', error: 'Generation failed' });
            return;
          }

          // Save each returned image to the app gallery so it shows up on
          // the Image page and can be reused later.
          const saved = await window.api.images.save({
            url: result.resultUrls[0],
            prompt,
            aspectRatio,
          });

          updateSlot(slotId, { status: 'success', image: saved });
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Generation failed';
          updateSlot(slotId, { status: 'error', error: message });
        }
      }),
    );

    set({ isGenerating: false });

    // Final toast summary.
    const { results } = get();
    const successCount = results.filter((s) => s.status === 'success').length;
    if (successCount === 0) {
      toast.error('None of the ads generated successfully. Please try again.');
    } else if (successCount < results.length) {
      toast.success(`Generated ${successCount} of ${results.length} ads`);
    } else {
      toast.success(`Generated ${successCount} ads`);
    }
  },
}));
