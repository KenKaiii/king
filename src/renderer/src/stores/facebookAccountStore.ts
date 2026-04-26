import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

/**
 * Dashboard-level selection of which ad account / page the Facebook Ads
 * page is currently looking at. Persisted so a switch survives reloads,
 * but can be overridden per-action by the New Ad wizard.
 */
interface FacebookAccountStore {
  selectedAdAccountId: string | null;
  selectedPageId: string | null;
  setSelectedAdAccountId: (id: string | null) => void;
  setSelectedPageId: (id: string | null) => void;
}

export const useFacebookAccountStore = create<FacebookAccountStore>()(
  persist(
    (set) => ({
      selectedAdAccountId: null,
      selectedPageId: null,
      setSelectedAdAccountId: (selectedAdAccountId) => set({ selectedAdAccountId }),
      setSelectedPageId: (selectedPageId) => set({ selectedPageId }),
    }),
    {
      name: 'facebook-account',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
