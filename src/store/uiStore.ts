import { create } from "zustand";

interface SearchResult {
  id: string;
  title: string;
  content_preview: string;
  note_type: string;
  chapter_id: string;
  book_id: string;
  book_title: string;
  chapter_title: string;
}

interface UIState {
  isPinned: boolean;
  searchQuery: string;
  searchResults: SearchResult[];
  showSearch: boolean;
  showSettings: boolean;
  setPinned: (pinned: boolean) => void;
  setSearchQuery: (query: string) => void;
  setSearchResults: (results: SearchResult[]) => void;
  setShowSearch: (show: boolean) => void;
  setShowSettings: (show: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isPinned: false,
  searchQuery: "",
  searchResults: [],
  showSearch: false,
  showSettings: false,

  setPinned: (pinned) => set({ isPinned: pinned }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSearchResults: (results) => set({ searchResults: results }),
  setShowSearch: (show) => set({ showSearch: show }),
  setShowSettings: (show) => set({ showSettings: show }),
}));
