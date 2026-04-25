import { create } from 'zustand';

export interface PendingGeneration {
  id: string;
  type: 'image';
  startedAt: number;
  prompt?: string;
}

interface GenerationStore {
  pendingImageGenerations: PendingGeneration[];
  addImageGeneration: (id: string, prompt?: string) => void;
  removeImageGeneration: (id: string) => void;
  clearImageGenerations: () => void;
}

export const useGenerationStore = create<GenerationStore>()((set) => ({
  pendingImageGenerations: [],

  addImageGeneration: (id, prompt) =>
    set((state) => ({
      pendingImageGenerations: [
        ...state.pendingImageGenerations,
        { id, type: 'image', startedAt: Date.now(), prompt },
      ],
    })),

  removeImageGeneration: (id) =>
    set((state) => ({
      pendingImageGenerations: state.pendingImageGenerations.filter((gen) => gen.id !== id),
    })),

  clearImageGenerations: () => set({ pendingImageGenerations: [] }),
}));
