import { create } from "zustand";
import {
  getBooks,
  createBook as bridgeCreateBook,
  updateBook as bridgeUpdateBook,
  deleteBook as bridgeDeleteBook,
  reorderBooks as bridgeReorderBooks,
} from "../utils/bridge";

export interface Book {
  id: string;
  title: string;
  color: string;
  icon: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
  is_archived: boolean;
}

interface BookState {
  books: Book[];
  selectedBookId: string | null;
  loading: boolean;
  loadBooks: () => Promise<void>;
  createBook: (title: string, color: string, icon: string) => Promise<Book>;
  updateBook: (id: string, updates: Partial<Book>) => Promise<void>;
  deleteBook: (id: string) => Promise<void>;
  selectBook: (id: string | null) => void;
  reorderBooks: (ids: string[]) => Promise<void>;
}

export const useBookStore = create<BookState>((set, get) => ({
  books: [],
  selectedBookId: null,
  loading: false,

  loadBooks: async () => {
    set({ loading: true });
    try {
      const books = await getBooks();
      set({ books, loading: false });
    } catch (e) {
      console.error("Failed to load books", e);
      set({ loading: false });
    }
  },

  createBook: async (title, color, icon) => {
    const book = await bridgeCreateBook(title, color, icon);
    set((s) => ({ books: [...s.books, book], selectedBookId: book.id }));
    return book;
  },

  updateBook: async (id, updates) => {
    await bridgeUpdateBook(id, updates);
    set((s) => ({
      books: s.books.map((b) =>
        b.id === id ? { ...b, ...updates } : b
      ),
    }));
  },

  deleteBook: async (id) => {
    await bridgeDeleteBook(id);
    set((s) => ({
      books: s.books.filter((b) => b.id !== id),
      selectedBookId: s.selectedBookId === id ? null : s.selectedBookId,
    }));
  },

  selectBook: (id) => set({ selectedBookId: id }),

  reorderBooks: async (ids) => {
    await bridgeReorderBooks(ids);
    set((s) => {
      const reordered = ids
        .map((id, i) => {
          const book = s.books.find((b) => b.id === id);
          return book ? { ...book, sort_order: i } : null;
        })
        .filter(Boolean) as Book[];
      return { books: reordered };
    });
  },
}));
