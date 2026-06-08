import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { SavedItem, SavedItemType } from '@/types/cricket';
import { persistStorage } from '@/services/storage';

interface SavedState {
  savedItems: SavedItem[];
  recentSearches: string[];
  toggleSaved: (item: SavedItem) => void;
  isSaved: (id: string, type: SavedItemType) => boolean;
  addRecentSearch: (query: string) => void;
}

export const useSavedStore = create<SavedState>()(
  persist(
    (set, get) => ({
      savedItems: [],
      recentSearches: [],
      toggleSaved: (item) =>
        set((state) => {
          const exists = state.savedItems.some((savedItem) => savedItem.id === item.id && savedItem.type === item.type);

          return {
            savedItems: exists
              ? state.savedItems.filter((savedItem) => !(savedItem.id === item.id && savedItem.type === item.type))
              : [item, ...state.savedItems],
          };
        }),
      isSaved: (id, type) => get().savedItems.some((item) => item.id === id && item.type === type),
      addRecentSearch: (query) =>
        set((state) => {
          const normalized = query.trim();

          if (!normalized) {
            return state;
          }

          return {
            recentSearches: [normalized, ...state.recentSearches.filter((item) => item !== normalized)].slice(0, 6),
          };
        }),
    }),
    {
      name: 'saved-store',
      storage: createJSONStorage(() => persistStorage),
      partialize: (state) => ({
        savedItems: state.savedItems,
        recentSearches: state.recentSearches,
      }),
    }
  )
);
