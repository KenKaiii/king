import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

/**
 * Which fal.ai image model the app routes generations through. Switched
 * from the Settings modal; persisted to localStorage so the choice
 * survives reloads.
 *
 *   - `nano_banana_pro` — Google Gemini 3 Pro Image (`fal-ai/nano-banana-pro`)
 *   - `gpt_image_2` — OpenAI GPT Image 2 (`fal-ai/gpt-image-2`)
 */
export type ImageModel = 'nano_banana_pro' | 'gpt_image_2';

interface ModelStore {
  selectedModel: ImageModel;
  setSelectedModel: (model: ImageModel) => void;
}

export const useModelStore = create<ModelStore>()(
  persist(
    (set) => ({
      selectedModel: 'nano_banana_pro',
      setSelectedModel: (selectedModel) => set({ selectedModel }),
    }),
    {
      name: 'image-model',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
