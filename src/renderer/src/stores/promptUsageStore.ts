import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface PromptUsageStore {
  counts: Record<string, number>;
  incrementUsage: (promptId: string) => void;
  getCount: (promptId: string) => number;
  resetUsage: () => void;
}

export const usePromptUsageStore = create<PromptUsageStore>()(
  persist(
    (set, get) => ({
      counts: {},

      incrementUsage: (promptId) =>
        set((state) => ({
          counts: {
            ...state.counts,
            [promptId]: (state.counts[promptId] ?? 0) + 1,
          },
        })),

      getCount: (promptId) => get().counts[promptId] ?? 0,

      resetUsage: () => set({ counts: {} }),
    }),
    {
      name: 'prompt-usage',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
