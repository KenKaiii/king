import { create } from 'zustand';
import { toast } from 'sonner';
import {
  CLONE_GENERATION_COUNT,
  CLONE_OUTPUT_FORMAT,
  CLONE_RESOLUTION,
  buildClonePrompt,
} from '@/lib/constants/clone';
import { detectSoftRefusal } from '@/lib/imageHash';
import type { EntityData, GeneratedImageData } from '@/types/electron';

export type CloneStepId = 'source' | 'character' | 'tweaks' | 'format' | 'results';

export interface CloneResultSlot {
  id: string;
  status: 'pending' | 'success' | 'error';
  image?: GeneratedImageData;
  error?: string;
}

// Max character reference images to include. Google's Gemini 3 Pro Image
// officially supports up to 5 character images for identity consistency;
// more angles = better triangulation of the character's face and body.
// https://ai.google.dev/gemini-api/docs/image-generation
const MAX_CHARACTER_REFERENCES = 5;

/**
 * A source image the user uploads as the scene to clone. Kept as an
 * in-memory data URL so it can be passed straight to the generate IPC
 * without touching disk.
 */
export interface SourceImage {
  dataUrl: string;
  name: string;
  // Natural aspect ratio of the source, used to preselect the closest
  // supported output ratio (1:1 / 4:5 / 9:16 / 16:9).
  width: number;
  height: number;
}

interface CloneStore {
  step: CloneStepId;
  sourceImage: SourceImage | null;
  selectedCharacterId: string | null;
  tweaks: string;
  aspectRatio: string;

  results: CloneResultSlot[];
  isGenerating: boolean;

  // Cancellation nonce — see createAdsStore for the design notes.
  generationId: number;

  lastGenerationInputs: {
    prompt: string;
    imageUrls: string[];
    aspectRatio: string;
  } | null;

  setStep: (step: CloneStepId) => void;
  setSourceImage: (source: SourceImage | null) => void;
  setSelectedCharacterId: (id: string | null) => void;
  setTweaks: (tweaks: string) => void;
  setAspectRatio: (ratio: string) => void;
  removeResultByImageId: (imageId: string) => void;
  startNewClone: () => void;

  runGeneration: (character: EntityData) => Promise<void>;
  retrySlot: (slotId: string) => Promise<void>;
}

const INITIAL_STATE = {
  step: 'source' as CloneStepId,
  sourceImage: null as SourceImage | null,
  selectedCharacterId: null,
  tweaks: '',
  aspectRatio: '1:1',
  results: [] as CloneResultSlot[],
  isGenerating: false,
  generationId: 0,
  lastGenerationInputs: null as CloneStore['lastGenerationInputs'],
};

export const useCloneStore = create<CloneStore>((set, get) => ({
  ...INITIAL_STATE,

  setStep: (step) => set({ step }),
  setSourceImage: (sourceImage) => set({ sourceImage }),
  setSelectedCharacterId: (selectedCharacterId) => set({ selectedCharacterId }),
  setTweaks: (tweaks) => set({ tweaks }),
  setAspectRatio: (aspectRatio) => set({ aspectRatio }),

  removeResultByImageId: (imageId) =>
    set((state) => ({
      results: state.results.filter((slot) => slot.image?.id !== imageId),
    })),

  startNewClone: () => set({ ...INITIAL_STATE }),

  runGeneration: async (character) => {
    const { sourceImage, tweaks, aspectRatio } = get();

    if (!sourceImage) {
      toast.error('Upload a reference image first.');
      return;
    }

    const thisGenId = get().generationId + 1;

    const slotIds = Array.from(
      { length: CLONE_GENERATION_COUNT },
      (_, i) => `clone-${Date.now()}-${i}`,
    );
    set({
      step: 'results',
      isGenerating: true,
      generationId: thisGenId,
      results: slotIds.map((id) => ({ id, status: 'pending' })),
    });

    const characterUrls = character.referenceImages.slice(0, MAX_CHARACTER_REFERENCES);
    if (characterUrls.length === 0) {
      toast.error('This character has no images yet. Add at least one on the Characters page.');
      set({ isGenerating: false, results: [], step: 'format' });
      return;
    }

    const prompt = buildClonePrompt(tweaks, aspectRatio);
    const imageUrls = [sourceImage.dataUrl, ...characterUrls];

    set({ lastGenerationInputs: { prompt, imageUrls, aspectRatio } });

    await Promise.all(slotIds.map((slotId) => generateSingleSlot(slotId, set, thisGenId)));

    if (useCloneStore.getState().generationId !== thisGenId) return;

    set({ isGenerating: false });

    const { results } = get();
    const successCount = results.filter((s) => s.status === 'success').length;
    if (successCount === 0) {
      toast.error('None of the clones generated successfully. Please try again.');
    } else if (successCount < results.length) {
      toast.success(`Generated ${successCount} of ${results.length} clones.`);
    } else {
      toast.success(`Generated ${successCount} clones.`);
    }
  },

  retrySlot: async (slotId) => {
    const { lastGenerationInputs, results, generationId } = get();
    if (!lastGenerationInputs) return;
    if (!results.some((s) => s.id === slotId)) return;

    set((state) => ({
      results: state.results.map((s) => (s.id === slotId ? { id: s.id, status: 'pending' } : s)),
    }));

    await generateSingleSlot(slotId, set, generationId, lastGenerationInputs);
  },
}));

async function generateSingleSlot(
  slotId: string,
  set: (partial: Partial<CloneStore> | ((state: CloneStore) => Partial<CloneStore>)) => void,
  ownedGenId: number,
  explicitInputs?: {
    prompt: string;
    imageUrls: string[];
    aspectRatio: string;
  },
): Promise<void> {
  const inputs = explicitInputs ?? useCloneStore.getState().lastGenerationInputs;
  if (!inputs) return;

  // If the store's generationId has moved on since this call started
  // (the user began a fresh wizard session), we skip writing to the
  // wizard's results — but the fal request itself still completes and
  // its output is still saved to the gallery, so background work is
  // never lost when the user moves on.
  const updateSlot = (update: Partial<CloneResultSlot>) => {
    if (useCloneStore.getState().generationId !== ownedGenId) return;
    set((state: CloneStore) => ({
      results: state.results.map((s) => (s.id === slotId ? { ...s, ...update } : s)),
    }));
  };

  // Run one attempt against a specific model variant. Returns the output
  // URL on success, or null if fal returned no image. Throws on network
  // / API error (caller handles).
  const callFal = async (modelVariant: 'pro' | 'flash'): Promise<string | null> => {
    const result = await window.api.generate.image({
      prompt: inputs.prompt,
      aspectRatio: inputs.aspectRatio,
      resolution: CLONE_RESOLUTION,
      outputFormat: CLONE_OUTPUT_FORMAT,
      imageUrls: inputs.imageUrls,
      modelVariant,
    });
    if (!result.success || !result.resultUrls?.length) return null;
    return result.resultUrls[0];
  };

  try {
    // First attempt on Nano Banana Pro (the quality tier).
    let outputUrl = await callFal('pro');
    let variantUsed: 'pro' | 'flash' = 'pro';

    // If fal returned no image, or Gemini soft-refused by echoing one of
    // our input images, auto-retry once on Nano Banana 2 (different
    // deploy-time safety tuning, partial overlap — often succeeds where
    // Pro didn't). Covers both failure modes the user's hitting.
    const isSoftRefusal =
      outputUrl !== null && (await detectSoftRefusal(outputUrl, inputs.imageUrls)).isSoftRefusal;

    if (outputUrl === null || isSoftRefusal) {
      try {
        const retryUrl = await callFal('flash');
        if (retryUrl) {
          // Don't blindly trust the retry either — check again.
          const retryCheck = await detectSoftRefusal(retryUrl, inputs.imageUrls);
          if (!retryCheck.isSoftRefusal) {
            outputUrl = retryUrl;
            variantUsed = 'flash';
          }
        }
      } catch {
        // Retry itself errored — fall through to the soft-refusal / null
        // handling below so the user sees the best available message.
      }
    }

    if (outputUrl === null) {
      updateSlot({ status: 'error', error: "Couldn't generate this one." });
      return;
    }

    // Final soft-refusal check on whatever we ended up with — if both
    // Pro and Flash echoed an input back at us, surface that clearly so
    // the user knows retrying on the same inputs won't help.
    const finalCheck = await detectSoftRefusal(outputUrl, inputs.imageUrls);
    if (finalCheck.isSoftRefusal) {
      updateSlot({
        status: 'error',
        error:
          'Google returned your reference image instead of the edit (a soft refusal). Try a different scene or character reference.',
      });
      return;
    }

    const saved = await window.api.images.save({
      url: outputUrl,
      prompt: inputs.prompt,
      aspectRatio: inputs.aspectRatio,
    });

    updateSlot({ status: 'success', image: saved });
    if (variantUsed === 'flash') {
      // Light breadcrumb so we can tell from the main log when the
      // fallback rescued a generation.
      console.log('[clone] slot', slotId, 'rescued by nano-banana-2');
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Couldn't generate this one.";
    updateSlot({ status: 'error', error: message });
  }
}
