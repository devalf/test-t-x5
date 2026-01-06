import { create } from 'zustand';

interface SearchState {
  searchQuery: string;
  debouncedSearchQuery: string;
  setSearchQuery: (query: string) => void;
  resetSearch: () => void;
}

// Store timeout in closure to avoid unnecessary re-renders
let debounceTimeout: ReturnType<typeof setTimeout> | undefined;

export const useSearchStore = create<SearchState>((set) => ({
  searchQuery: '',
  debouncedSearchQuery: '',

  setSearchQuery: (query: string) => {
    // Clear existing timeout
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }

    // Set new debounced value after 500ms
    debounceTimeout = setTimeout(() => {
      set({ debouncedSearchQuery: query });
    }, 500);

    set({ searchQuery: query });
  },

  resetSearch: () => {
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
      debounceTimeout = undefined;
    }
    set({
      searchQuery: '',
      debouncedSearchQuery: '',
    });
  },
}));
