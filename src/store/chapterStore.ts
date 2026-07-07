import { create } from "zustand";
import {
  getChapters,
  createChapter as bridgeCreateChapter,
  updateChapter as bridgeUpdateChapter,
  deleteChapter as bridgeDeleteChapter,
  reorderChapters as bridgeReorderChapters,
} from "../utils/bridge";

export interface Chapter {
  id: string;
  book_id: string;
  title: string;
  color: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
  is_archived: boolean;
}

interface ChapterState {
  chapters: Chapter[];
  selectedChapterId: string | null;
  loading: boolean;
  loadChapters: (bookId: string) => Promise<void>;
  createChapter: (bookId: string, title: string, color?: string) => Promise<Chapter>;
  updateChapter: (id: string, updates: Partial<Chapter>) => Promise<void>;
  deleteChapter: (id: string) => Promise<void>;
  selectChapter: (id: string | null) => void;
  reorderChapters: (ids: string[]) => Promise<void>;
}

export const useChapterStore = create<ChapterState>((set, get) => ({
  chapters: [],
  selectedChapterId: null,
  loading: false,

  loadChapters: async (bookId) => {
    set({ loading: true });
    try {
      const chapters = await getChapters(bookId);
      set({ chapters, loading: false });
    } catch (e) {
      console.error("Failed to load chapters", e);
      set({ loading: false });
    }
  },

  createChapter: async (bookId, title, color) => {
    const chapter = await bridgeCreateChapter(bookId, title, color);
    set((s) => ({ chapters: [...s.chapters, chapter] }));
    return chapter;
  },

  updateChapter: async (id, updates) => {
    await bridgeUpdateChapter(id, updates);
    set((s) => ({
      chapters: s.chapters.map((c) =>
        c.id === id ? { ...c, ...updates } : c
      ),
    }));
  },

  deleteChapter: async (id) => {
    await bridgeDeleteChapter(id);
    set((s) => ({
      chapters: s.chapters.filter((c) => c.id !== id),
      selectedChapterId: s.selectedChapterId === id ? null : s.selectedChapterId,
    }));
  },

  selectChapter: (id) => set({ selectedChapterId: id }),

  reorderChapters: async (ids) => {
    await bridgeReorderChapters(ids);
    set((s) => {
      const reordered = ids
        .map((id, i) => {
          const ch = s.chapters.find((c) => c.id === id);
          return ch ? { ...ch, sort_order: i } : null;
        })
        .filter(Boolean) as Chapter[];
      return { chapters: reordered };
    });
  },
}));
