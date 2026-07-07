import { create } from "zustand";
import {
  getNotes,
  createNote as bridgeCreateNote,
  updateNote as bridgeUpdateNote,
  deleteNote as bridgeDeleteNote,
} from "../utils/bridge";

export interface Note {
  id: string;
  chapter_id: string;
  title: string;
  content: string;
  color: string | null;
  is_pinned: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  is_archived: boolean;
}

interface NoteState {
  notes: Note[];
  selectedNoteId: string | null;
  loading: boolean;
  loadNotes: (chapterId: string) => Promise<void>;
  createNote: (chapterId: string) => Promise<Note>;
  updateNote: (id: string, updates: Partial<Note>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  selectNote: (id: string | null) => void;
  togglePin: (id: string) => Promise<void>;
}

export const useNoteStore = create<NoteState>((set, get) => ({
  notes: [],
  selectedNoteId: null,
  loading: false,

  loadNotes: async (chapterId) => {
    set({ loading: true });
    try {
      const notes = await getNotes(chapterId);
      set({ notes, loading: false });
    } catch (e) {
      console.error("Failed to load notes", e);
      set({ loading: false });
    }
  },

  createNote: async (chapterId) => {
    const note = await bridgeCreateNote(chapterId);
    set((s) => ({ notes: [note, ...s.notes], selectedNoteId: note.id }));
    return note;
  },

  updateNote: async (id, updates) => {
    await bridgeUpdateNote(id, updates);
    set((s) => ({
      notes: s.notes.map((n) =>
        n.id === id ? { ...n, ...updates } : n
      ),
    }));
  },

  deleteNote: async (id) => {
    await bridgeDeleteNote(id);
    set((s) => ({
      notes: s.notes.filter((n) => n.id !== id),
      selectedNoteId: s.selectedNoteId === id ? null : s.selectedNoteId,
    }));
  },

  selectNote: (id) => set({ selectedNoteId: id }),

  togglePin: async (id) => {
    const note = get().notes.find((n) => n.id === id);
    if (!note) return;
    await bridgeUpdateNote(id, { is_pinned: !note.is_pinned });
    set((s) => ({
      notes: s.notes.map((n) =>
        n.id === id ? { ...n, is_pinned: !n.is_pinned } : n
      ),
    }));
  },
}));
