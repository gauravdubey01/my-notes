function getBridge(): any {
  const w = window as any;
  if (w.chrome?.webview?.hostObjects?.bridge) {
    return w.chrome.webview.hostObjects.bridge;
  }
  return null;
}

export function bridgeAvailable(): boolean {
  return getBridge() !== null;
}

async function call<T>(fn: () => any, fallback?: T): Promise<T> {
  try {
    const bridge = getBridge();
    if (!bridge) {
      if (fallback !== undefined) return fallback;
      return [] as any;
    }
    const result = await fn();
    if (typeof result === "string") {
      if (result === "null" || result === "") return null as any;
      return JSON.parse(result);
    }
    return result;
  } catch {
    if (fallback !== undefined) return fallback;
    return [] as any;
  }
}

// ——— Books ———

export async function getBooks(): Promise<any[]> {
  return call(() => getBridge().GetBooks(), []);
}

export async function createBook(
  title: string,
  color: string,
  icon: string
): Promise<any> {
  return call(() => getBridge().CreateBook(title, color, icon));
}

export async function updateBook(
  id: string,
  updates: Record<string, any>
): Promise<any> {
  return call(() => getBridge().UpdateBook(id, JSON.stringify(updates)));
}

export async function deleteBook(id: string): Promise<void> {
  return call(() => getBridge().DeleteBook(id));
}

export async function reorderBooks(ids: string[]): Promise<void> {
  return call(() => getBridge().ReorderBooks(JSON.stringify(ids)));
}

// ——— Chapters ———

export async function getChapters(bookId: string): Promise<any[]> {
  return call(() => getBridge().GetChapters(bookId), []);
}

export async function createChapter(
  bookId: string,
  title: string,
  color?: string
): Promise<any> {
  return call(() => getBridge().CreateChapter(bookId, title, color || ""));
}

export async function updateChapter(
  id: string,
  updates: Record<string, any>
): Promise<any> {
  return call(() => getBridge().UpdateChapter(id, JSON.stringify(updates)));
}

export async function deleteChapter(id: string): Promise<void> {
  return call(() => getBridge().DeleteChapter(id));
}

export async function reorderChapters(ids: string[]): Promise<void> {
  return call(() => getBridge().ReorderChapters(JSON.stringify(ids)));
}

// ——— Notes ———

export async function getNotes(chapterId: string): Promise<any[]> {
  return call(() => getBridge().GetNotes(chapterId), []);
}

export async function createNote(chapterId: string): Promise<any> {
  return call(() => getBridge().CreateNote(chapterId));
}

export async function updateNote(
  id: string,
  updates: Record<string, any>
): Promise<any> {
  return call(() => getBridge().UpdateNote(id, JSON.stringify(updates)));
}

export async function deleteNote(id: string): Promise<void> {
  return call(() => getBridge().DeleteNote(id));
}

// ——— Search ———

export async function searchNotes(query: string): Promise<any[]> {
  return call(() => getBridge().SearchNotes(query), []);
}

// ——— Window ———

export async function togglePin(): Promise<boolean> {
  return call(() => getBridge().TogglePin(), false);
}

export async function getPinState(): Promise<boolean> {
  return call(() => getBridge().GetPinState(), false);
}

// ——— Backup ———

export async function exportBackup(): Promise<string> {
  return call(() => getBridge().ExportBackup(), "{}");
}

export async function importBackup(json: string): Promise<void> {
  return call(() => getBridge().ImportBackup(json));
}
