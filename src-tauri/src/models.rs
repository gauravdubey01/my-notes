use serde::{Deserialize, Serialize};
use chrono::Utc;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Book {
    pub id: String,
    pub title: String,
    pub color: String,
    pub icon: String,
    pub sort_order: i32,
    pub created_at: String,
    pub updated_at: String,
    pub is_archived: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Chapter {
    pub id: String,
    pub book_id: String,
    pub title: String,
    pub color: String,
    pub sort_order: i32,
    pub created_at: String,
    pub updated_at: String,
    pub is_archived: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Note {
    pub id: String,
    pub chapter_id: String,
    pub title: String,
    pub content: String,
    pub color: Option<String>,
    pub is_pinned: bool,
    pub sort_order: i32,
    pub created_at: String,
    pub updated_at: String,
    pub is_archived: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct AppData {
    pub books: Vec<Book>,
    pub chapters: Vec<Chapter>,
    pub notes: Vec<Note>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SearchResult {
    pub id: String,
    pub title: String,
    pub content_preview: String,
    pub chapter_id: String,
    pub book_id: String,
    pub book_title: String,
    pub chapter_title: String,
}

pub fn now() -> String {
    Utc::now().to_rfc3339()
}

pub fn new_id() -> String {
    uuid::Uuid::new_v4().to_string()
}

impl Book {
    pub fn new(title: String, color: String, icon: String, sort_order: i32) -> Self {
        Self {
            id: new_id(),
            title,
            color,
            icon,
            sort_order,
            created_at: now(),
            updated_at: now(),
            is_archived: false,
        }
    }
}

impl Chapter {
    pub fn new(book_id: String, title: String, color: String, sort_order: i32) -> Self {
        Self {
            id: new_id(),
            book_id,
            title,
            color,
            sort_order,
            created_at: now(),
            updated_at: now(),
            is_archived: false,
        }
    }
}

impl Note {
    pub fn new(chapter_id: String, sort_order: i32) -> Self {
        Self {
            id: new_id(),
            chapter_id,
            title: "Untitled".to_string(),
            content: String::new(),
            color: None,
            is_pinned: false,
            sort_order,
            created_at: now(),
            updated_at: now(),
            is_archived: false,
        }
    }
}
