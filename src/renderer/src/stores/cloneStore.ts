import { create } from 'zustand';
import { toast } from 'sonner';
import {
  CLONE_GENERATION_COUNT,
  CLONE_OUTPUT_FORMAT,
  CLONE_RESOLUTION,
  buildClonePrompt,
} from '@/lib/constants/clone';
import { detectSoftRefusal } from '@/lib/imageHash';
import { useModelStore } from '@/stores/modelStore';
import { useImagesStore } from '@/stores/imagesStore';
import { cleanIpcError } from '@/lib/ipcError';
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

export const useCloneStore = create<CloneStore>()((set, get) => ({
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

  try {
    const modelVariant = useModelStore.getState().selectedModel;
    const result = await window.api.generate.image({
      prompt: inputs.prompt,
      aspectRatio: inputs.aspectRatio,
      resolution: CLONE_RESOLUTION,
      outputFormat: CLONE_OUTPUT_FORMAT,
      imageUrls: inputs.imageUrls,
      modelVariant,
    });

    const outputUrl = result.success ? (result.resultUrls?.[0] ?? null) : null;

    if (outputUrl === null) {
      updateSlot({ status: 'error', error: "Couldn't generate this one." });
      return;
    }

    // Soft-refusal check — Gemini sometimes echoes back one of the input
    // images instead of generating a new one. Surface that clearly so the
    // user knows retrying on the same inputs won't help. (GPT Image 2
    // doesn't exhibit this failure mode the same way, but the check is
    // cheap and harmless either way.)
    const refusalCheck = await detectSoftRefusal(outputUrl, inputs.imageUrls);
    if (refusalCheck.isSoftRefusal) {
      updateSlot({
        status: 'error',
        error:
          'The model returned your reference image instead of the edit (a soft refusal). Try a different scene or character reference.',
      });
      return;
    }

    const saved = await window.api.images.save({
      url: outputUrl,
      prompt: inputs.prompt,
      aspectRatio: inputs.aspectRatio,
      model: modelVariant,
    });

    // Push into the global gallery store so the Image page picks it up
    // immediately, even though the user is currently on the Clone page.
    useImagesStore.getState().addImage(saved);

    updateSlot({ status: 'success', image: saved });
  } catch (err) {
    const message = cleanIpcError(err, "Couldn't generate this one.");
    updateSlot({ status: 'error', error: message });
  }
}
