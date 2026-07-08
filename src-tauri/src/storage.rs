use std::path::PathBuf;
use std::sync::{Arc, RwLock};

use crate::models::*;

pub struct AppState {
    pub data: Arc<RwLock<AppData>>,
    pub always_on_top: Arc<RwLock<bool>>,
    data_path: PathBuf,
}

impl AppState {
    pub fn new() -> Self {
        let data_dir = dirs::data_local_dir()
            .unwrap_or_else(|| PathBuf::from("."))
            .join("MyNeatbook");
        std::fs::create_dir_all(&data_dir).ok();
        let data_path = data_dir.join("data.json");

        let data = if data_path.exists() {
            std::fs::read_to_string(&data_path)
                .ok()
                .and_then(|s| serde_json::from_str::<AppData>(&s).ok())
                .unwrap_or_default()
        } else {
            AppData::default()
        };

        let state = Self {
            data: Arc::new(RwLock::new(data)),
            always_on_top: Arc::new(RwLock::new(false)),
            data_path,
        };

        state.seed_if_empty();
        state
    }

    fn seed_if_empty(&self) {
        let mut data = self.data.write().unwrap();
        if !data.books.is_empty() {
            return;
        }

        let icons = ["📖", "📓", "📕"];
        let colors = ["#8B7355", "#2C5F2D", "#5B7B9A"];

        for j in 1..=3 {
            let book = Book::new(
                format!("Journal {}", j),
                colors[j - 1].to_string(),
                icons[j - 1].to_string(),
                (j - 1) as i32,
            );
            let book_id = book.id.clone();
            data.books.push(book);

            for c in 1..=3 {
                let chapter = Chapter::new(
                    book_id.clone(),
                    format!("Chapter {}.{}", j, c),
                    String::new(),
                    (c - 1) as i32,
                );
                let chapter_id = chapter.id.clone();
                data.chapters.push(chapter);

                for n in 1..=3 {
                    let note = Note::new(chapter_id.clone(), (n - 1) as i32);
                    let mut note = note;
                    note.title = format!("Entry {}.{}.{}", j, c, n);
                    note.content = format!(
                        "<p>Welcome to <strong>Entry {}.{}.{}</strong>! This is a sample entry in Journal {}, Chapter {}.</p><p>Start writing your thoughts here.</p>",
                        j, c, n, j, c
                    );
                    data.notes.push(note);
                }
            }
        }

        self.persist(&data);
    }

    fn persist(&self, data: &AppData) {
        if let Ok(json) = serde_json::to_string_pretty(data) {
            std::fs::write(&self.data_path, json).ok();
        }
    }

    pub fn save(&self, data: &AppData) {
        self.persist(data);
    }

    pub fn export_json(&self) -> String {
        let data = self.data.read().unwrap();
        serde_json::to_string_pretty(&*data).unwrap_or_default()
    }

    pub fn import_json(&self, json: &str) -> Result<(), String> {
        let incoming: AppData =
            serde_json::from_str(json).map_err(|e| format!("Invalid backup: {}", e))?;
        let mut data = self.data.write().unwrap();

        for mut b in incoming.books {
            b.is_archived = false;
            data.books.push(b);
        }
        for mut c in incoming.chapters {
            c.is_archived = false;
            data.chapters.push(c);
        }
        for mut n in incoming.notes {
            n.is_archived = false;
            data.notes.push(n);
        }

        self.persist(&data);
        Ok(())
    }
}
