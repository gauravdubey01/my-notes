use std::collections::HashMap;
use std::fs;

use tauri::State;
use tauri_plugin_dialog::DialogExt;

use crate::models::*;
use crate::storage::AppState;

// ——— Books ———

#[tauri::command]
pub fn get_books(state: State<'_, AppState>) -> Result<Vec<Book>, String> {
    let data = state.data.read().map_err(|e| e.to_string())?;
    let mut books: Vec<Book> = data.books.iter().filter(|b| !b.is_archived).cloned().collect();
    books.sort_by_key(|b| b.sort_order);
    Ok(books)
}

#[tauri::command]
pub fn create_book(
    title: String,
    color: String,
    icon: String,
    state: State<'_, AppState>,
) -> Result<Book, String> {
    let mut data = state.data.write().map_err(|e| e.to_string())?;
    let book = Book::new(title, color, icon, data.books.len() as i32);
    data.books.push(book.clone());
    state.save(&data);
    Ok(book)
}

#[tauri::command]
pub fn update_book(
    id: String,
    updates: HashMap<String, serde_json::Value>,
    state: State<'_, AppState>,
) -> Result<Book, String> {
    let mut data = state.data.write().map_err(|e| e.to_string())?;
    let book = data
        .books
        .iter_mut()
        .find(|b| b.id == id)
        .ok_or_else(|| "Book not found".to_string())?;

    apply_book_updates(book, &updates);
    book.updated_at = now();
    let book = book.clone();
    state.save(&data);
    Ok(book)
}

#[tauri::command]
pub fn delete_book(id: String, state: State<'_, AppState>) -> Result<(), String> {
    let mut data = state.data.write().map_err(|e| e.to_string())?;

    if let Some(book) = data.books.iter_mut().find(|b| b.id == id) {
        book.is_archived = true;
        book.updated_at = now();
    }

    let chapter_ids: Vec<String> = data
        .chapters
        .iter()
        .filter(|c| c.book_id == id)
        .map(|c| c.id.clone())
        .collect();

    for ch in data
        .chapters
        .iter_mut()
        .filter(|c| chapter_ids.contains(&c.id))
    {
        ch.is_archived = true;
        ch.updated_at = now();
    }

    for note in data
        .notes
        .iter_mut()
        .filter(|n| chapter_ids.contains(&n.chapter_id))
    {
        note.is_archived = true;
        note.updated_at = now();
    }

    state.save(&data);
    Ok(())
}

#[tauri::command]
pub fn reorder_books(ids: Vec<String>, state: State<'_, AppState>) -> Result<(), String> {
    let mut data = state.data.write().map_err(|e| e.to_string())?;
    for (i, id) in ids.iter().enumerate() {
        if let Some(book) = data.books.iter_mut().find(|b| b.id == *id) {
            book.sort_order = i as i32;
            book.updated_at = now();
        }
    }
    state.save(&data);
    Ok(())
}

// ——— Chapters ———

#[tauri::command]
pub fn get_chapters(book_id: String, state: State<'_, AppState>) -> Result<Vec<Chapter>, String> {
    let data = state.data.read().map_err(|e| e.to_string())?;
    let mut chapters: Vec<Chapter> = data
        .chapters
        .iter()
        .filter(|c| c.book_id == book_id && !c.is_archived)
        .cloned()
        .collect();
    chapters.sort_by_key(|c| c.sort_order);
    Ok(chapters)
}

#[tauri::command]
pub fn create_chapter(
    book_id: String,
    title: String,
    color: String,
    state: State<'_, AppState>,
) -> Result<Chapter, String> {
    let mut data = state.data.write().map_err(|e| e.to_string())?;
    let sort_order = data
        .chapters
        .iter()
        .filter(|c| c.book_id == book_id)
        .count() as i32;
    let chapter = Chapter::new(book_id, title, color, sort_order);
    data.chapters.push(chapter.clone());
    state.save(&data);
    Ok(chapter)
}

#[tauri::command]
pub fn update_chapter(
    id: String,
    updates: HashMap<String, serde_json::Value>,
    state: State<'_, AppState>,
) -> Result<Chapter, String> {
    let mut data = state.data.write().map_err(|e| e.to_string())?;
    let ch = data
        .chapters
        .iter_mut()
        .find(|c| c.id == id)
        .ok_or_else(|| "Chapter not found".to_string())?;

    if let Some(v) = updates.get("title").and_then(|v| v.as_str()) {
        ch.title = v.to_string();
    }
    if let Some(v) = updates.get("color").and_then(|v| v.as_str()) {
        ch.color = v.to_string();
    }
    ch.updated_at = now();
    let ch = ch.clone();
    state.save(&data);
    Ok(ch)
}

#[tauri::command]
pub fn delete_chapter(id: String, state: State<'_, AppState>) -> Result<(), String> {
    let mut data = state.data.write().map_err(|e| e.to_string())?;

    if let Some(ch) = data.chapters.iter_mut().find(|c| c.id == id) {
        ch.is_archived = true;
        ch.updated_at = now();
    }
    for note in data.notes.iter_mut().filter(|n| n.chapter_id == id) {
        note.is_archived = true;
        note.updated_at = now();
    }

    state.save(&data);
    Ok(())
}

#[tauri::command]
pub fn reorder_chapters(ids: Vec<String>, state: State<'_, AppState>) -> Result<(), String> {
    let mut data = state.data.write().map_err(|e| e.to_string())?;
    for (i, id) in ids.iter().enumerate() {
        if let Some(ch) = data.chapters.iter_mut().find(|c| c.id == *id) {
            ch.sort_order = i as i32;
            ch.updated_at = now();
        }
    }
    state.save(&data);
    Ok(())
}

// ——— Notes ———

#[tauri::command]
pub fn get_notes(chapter_id: String, state: State<'_, AppState>) -> Result<Vec<Note>, String> {
    let data = state.data.read().map_err(|e| e.to_string())?;
    let mut notes: Vec<Note> = data
        .notes
        .iter()
        .filter(|n| n.chapter_id == chapter_id && !n.is_archived)
        .cloned()
        .collect();
    notes.sort_by(|a, b| {
        b.is_pinned
            .cmp(&a.is_pinned)
            .then_with(|| b.updated_at.cmp(&a.updated_at))
    });
    Ok(notes)
}

#[tauri::command]
pub fn create_note(chapter_id: String, state: State<'_, AppState>) -> Result<Note, String> {
    let mut data = state.data.write().map_err(|e| e.to_string())?;
    let sort_order = data
        .notes
        .iter()
        .filter(|n| n.chapter_id == chapter_id)
        .count() as i32;
    let note = Note::new(chapter_id, sort_order);
    data.notes.push(note.clone());
    state.save(&data);
    Ok(note)
}

#[tauri::command]
pub fn update_note(
    id: String,
    updates: HashMap<String, serde_json::Value>,
    state: State<'_, AppState>,
) -> Result<Note, String> {
    let mut data = state.data.write().map_err(|e| e.to_string())?;
    let note = data
        .notes
        .iter_mut()
        .find(|n| n.id == id)
        .ok_or_else(|| "Note not found".to_string())?;

    apply_note_updates(note, &updates);
    note.updated_at = now();
    let note = note.clone();
    state.save(&data);
    Ok(note)
}

#[tauri::command]
pub fn delete_note(id: String, state: State<'_, AppState>) -> Result<(), String> {
    let mut data = state.data.write().map_err(|e| e.to_string())?;
    if let Some(note) = data.notes.iter_mut().find(|n| n.id == id) {
        note.is_archived = true;
        note.updated_at = now();
    }
    state.save(&data);
    Ok(())
}

#[tauri::command]
pub fn search_notes(query: String, state: State<'_, AppState>) -> Result<Vec<SearchResult>, String> {
    if query.trim().is_empty() {
        return Ok(Vec::new());
    }

    let data = state.data.read().map_err(|e| e.to_string())?;
    let q = query.to_lowercase();
    let mut results = Vec::new();

    for note in data.notes.iter().filter(|n| !n.is_archived) {
        if !note.title.to_lowercase().contains(&q)
            && !note.content.to_lowercase().contains(&q)
        {
            continue;
        }

        let ch = data.chapters.iter().find(|c| c.id == note.chapter_id);
        let book = ch.and_then(|c| data.books.iter().find(|b| b.id == c.book_id));

        if let (Some(ch), Some(book)) = (ch, book) {
            if ch.is_archived || book.is_archived {
                continue;
            }

            let preview = if note.content.len() > 100 {
                format!("{}...", &note.content[..100])
            } else {
                note.content.clone()
            };

            results.push(SearchResult {
                id: note.id.clone(),
                title: note.title.clone(),
                content_preview: preview,
                chapter_id: note.chapter_id.clone(),
                book_id: book.id.clone(),
                book_title: book.title.clone(),
                chapter_title: ch.title.clone(),
            });
        }
    }

    results.sort_by(|a, b| a.title.cmp(&b.title));
    if results.len() > 50 {
        results.truncate(50);
    }

    Ok(results)
}

// ——— Window ———

#[tauri::command]
pub async fn toggle_pin(
    window: tauri::Window,
    state: State<'_, AppState>,
) -> Result<bool, String> {
    let mut pinned = state.always_on_top.write().map_err(|e| e.to_string())?;
    *pinned = !*pinned;
    window
        .set_always_on_top(*pinned)
        .map_err(|e| e.to_string())?;
    Ok(*pinned)
}

#[tauri::command]
pub async fn get_pin_state(state: State<'_, AppState>) -> Result<bool, String> {
    state.always_on_top.read().map_err(|e| e.to_string()).map(|v| *v)
}

#[tauri::command]
pub async fn close_window(window: tauri::Window) -> Result<(), String> {
    window.destroy().map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn minimize_window(window: tauri::Window) -> Result<(), String> {
    window.minimize().map_err(|e| e.to_string())
}

// ——— Backup ———

#[tauri::command]
pub async fn export_with_dialog(
    app: tauri::AppHandle,
    state: State<'_, AppState>,
) -> Result<String, String> {
    let file = app
        .dialog()
        .file()
        .add_filter("JSON Files", &["json"])
        .set_file_name(&format!(
            "my-neatbook-backup-{}.json",
            chrono::Local::now().format("%Y-%m-%d")
        ))
        .blocking_save_file();

    match file {
        Some(path) => {
            let path = path.as_path().ok_or_else(|| "Invalid path".to_string())?;
            let json = state.export_json();
            fs::write(path, json).map_err(|e| e.to_string())?;
            Ok("ok".to_string())
        }
        None => Ok("cancelled".to_string()),
    }
}

#[tauri::command]
pub async fn import_backup(
    app: tauri::AppHandle,
    state: State<'_, AppState>,
) -> Result<String, String> {
    let file = app
        .dialog()
        .file()
        .add_filter("JSON Files", &["json"])
        .blocking_pick_file();

    match file {
        Some(path) => {
            let path = path.as_path().ok_or_else(|| "Invalid path".to_string())?;
            let json = fs::read_to_string(path).map_err(|e| e.to_string())?;
            state.import_json(&json)?;
            Ok("ok".to_string())
        }
        None => Ok("cancelled".to_string()),
    }
}

// ——— Image picker ———

#[tauri::command]
pub async fn pick_image_base64(app: tauri::AppHandle) -> Result<String, String> {
    let file = app
        .dialog()
        .file()
        .add_filter(
            "Images",
            &["png", "jpg", "jpeg", "gif", "bmp", "webp"],
        )
        .blocking_pick_file();

    match file {
        Some(path) => {
            let path = path.as_path().ok_or_else(|| "Invalid path".to_string())?;
            let bytes = fs::read(path).map_err(|e| e.to_string())?;
            let ext = path
                .extension()
                .and_then(|e| e.to_str())
                .unwrap_or("png")
                .to_lowercase();
            let mime = match ext.as_str() {
                "png" => "image/png",
                "jpg" | "jpeg" => "image/jpeg",
                "gif" => "image/gif",
                "bmp" => "image/bmp",
                "webp" => "image/webp",
                _ => "image/png",
            };
            let b64 = base64_encode(&bytes);
            Ok(format!("data:{};base64,{}", mime, b64))
        }
        None => Ok(String::new()),
    }
}

fn base64_encode(bytes: &[u8]) -> String {
    const CHARS: &[u8] = b"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    let mut result = String::new();
    for chunk in bytes.chunks(3) {
        let b0 = chunk[0] as u32;
        let b1 = chunk.get(1).copied().unwrap_or(0) as u32;
        let b2 = chunk.get(2).copied().unwrap_or(0) as u32;
        let triple = (b0 << 16) | (b1 << 8) | b2;
        result.push(CHARS[((triple >> 18) & 0x3F) as usize] as char);
        result.push(CHARS[((triple >> 12) & 0x3F) as usize] as char);
        if chunk.len() > 1 {
            result.push(CHARS[((triple >> 6) & 0x3F) as usize] as char);
        } else {
            result.push('=');
        }
        if chunk.len() > 2 {
            result.push(CHARS[(triple & 0x3F) as usize] as char);
        } else {
            result.push('=');
        }
    }
    result
}

// ——— Helpers ———

fn apply_book_updates(book: &mut Book, updates: &HashMap<String, serde_json::Value>) {
    if let Some(v) = updates.get("title").and_then(|v| v.as_str()) {
        book.title = v.to_string();
    }
    if let Some(v) = updates.get("color").and_then(|v| v.as_str()) {
        book.color = v.to_string();
    }
    if let Some(v) = updates.get("icon").and_then(|v| v.as_str()) {
        book.icon = v.to_string();
    }
    if let Some(v) = updates.get("sort_order").and_then(|v| v.as_i64()) {
        book.sort_order = v as i32;
    }
}

fn apply_note_updates(note: &mut Note, updates: &HashMap<String, serde_json::Value>) {
    if let Some(v) = updates.get("title").and_then(|v| v.as_str()) {
        note.title = v.to_string();
    }
    if let Some(v) = updates.get("content").and_then(|v| v.as_str()) {
        note.content = v.to_string();
    }
    if let Some(v) = updates.get("color") {
        note.color = if v.is_null() || v.as_str().map_or(true, |s| s.is_empty()) {
            None
        } else {
            v.as_str().map(|s| s.to_string())
        };
    }
    if let Some(v) = updates.get("is_pinned").and_then(|v| v.as_bool()) {
        note.is_pinned = v;
    }
    if let Some(v) = updates.get("sort_order").and_then(|v| v.as_i64()) {
        note.sort_order = v as i32;
    }
}
