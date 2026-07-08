mod commands;
mod models;
mod storage;

use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            let state = storage::AppState::new();
            app.manage(state);
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::get_books,
            commands::create_book,
            commands::update_book,
            commands::delete_book,
            commands::reorder_books,
            commands::get_chapters,
            commands::create_chapter,
            commands::update_chapter,
            commands::delete_chapter,
            commands::reorder_chapters,
            commands::get_notes,
            commands::create_note,
            commands::update_note,
            commands::delete_note,
            commands::search_notes,
            commands::toggle_pin,
            commands::get_pin_state,
            commands::close_window,
            commands::minimize_window,
            commands::export_with_dialog,
            commands::import_backup,
            commands::pick_image_base64,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
