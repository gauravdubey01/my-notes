import { invoke } from "@tauri-apps/api/core";
import { open, save } from "@tauri-apps/plugin-dialog";
import { readFile } from "@tauri-apps/plugin-fs";

// ——— Books ———

export async function getBooks(): Promise<any[]> {
  return invoke("get_books");
}

export async function createBook(title: string, color: string, icon: string): Promise<any> {
  return invoke("create_book", { title, color, icon });
}

export async function updateBook(id: string, updates: Record<string, any>): Promise<any> {
  return invoke("update_book", { id, updates });
}

export async function deleteBook(id: string): Promise<void> {
  return invoke("delete_book", { id });
}

export async function reorderBooks(ids: string[]): Promise<void> {
  return invoke("reorder_books", { ids });
}

// ——— Chapters ———

export async function getChapters(bookId: string): Promise<any[]> {
  return invoke("get_chapters", { bookId });
}

export async function createChapter(bookId: string, title: string, color?: string): Promise<any> {
  return invoke("create_chapter", { bookId, title, color: color || "" });
}

export async function updateChapter(id: string, updates: Record<string, any>): Promise<any> {
  return invoke("update_chapter", { id, updates });
}

export async function deleteChapter(id: string): Promise<void> {
  return invoke("delete_chapter", { id });
}

export async function reorderChapters(ids: string[]): Promise<void> {
  return invoke("reorder_chapters", { ids });
}

// ——— Notes ———

export async function getNotes(chapterId: string): Promise<any[]> {
  return invoke("get_notes", { chapterId });
}

export async function createNote(chapterId: string): Promise<any> {
  return invoke("create_note", { chapterId });
}

export async function updateNote(id: string, updates: Record<string, any>): Promise<any> {
  return invoke("update_note", { id, updates });
}

export async function deleteNote(id: string): Promise<void> {
  return invoke("delete_note", { id });
}

// ——— Search ———

export async function searchNotes(query: string): Promise<any[]> {
  return invoke("search_notes", { query });
}

// ——— Window ———

export async function togglePin(): Promise<boolean> {
  return invoke("toggle_pin");
}

export async function getPinState(): Promise<boolean> {
  return invoke("get_pin_state");
}

export async function closeWindow(): Promise<void> {
  return invoke("close_window");
}

export async function minimizeWindow(): Promise<void> {
  return invoke("minimize_window");
}

// ——— Backup ———

export async function exportWithDialog(): Promise<string> {
  return invoke("export_with_dialog");
}

export async function importWithDialog(): Promise<string> {
  return invoke("import_backup");
}

// ——— Image picker ———

export async function pickImageBase64(): Promise<string> {
  return invoke("pick_image_base64");
}
