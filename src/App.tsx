import { useEffect, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useBookStore } from "./store/bookStore";
import { useChapterStore } from "./store/chapterStore";
import { useNoteStore } from "./store/noteStore";
import { useUIStore } from "./store/uiStore";
import TitleBar from "./components/Layout/TitleBar";
import Sidebar from "./components/Layout/Sidebar";
import ChapterList from "./components/Chapters/ChapterList";
import NoteEditor from "./components/Notes/NoteEditor";
import SettingsPanel from "./components/Settings/SettingsPanel";
import SearchOverlay from "./components/UI/SearchOverlay";

export default function App() {
  const { books, selectedBookId, selectBook, loadBooks } = useBookStore();
  const { chapters, selectedChapterId, selectChapter, loadChapters } =
    useChapterStore();
  const { notes, selectedNoteId, selectNote, loadNotes } = useNoteStore();
  const { showSettings, showSearch } = useUIStore();

  useEffect(() => {
    loadBooks();
  }, [loadBooks]);

  useEffect(() => {
    if (selectedBookId) {
      loadChapters(selectedBookId);
      selectChapter(null);
      selectNote(null);
    }
  }, [selectedBookId, loadChapters, selectChapter, selectNote]);

  useEffect(() => {
    if (selectedChapterId) {
      loadNotes(selectedChapterId);
      selectNote(null);
    }
  }, [selectedChapterId, loadNotes, selectNote]);

  const selectedBook = books.find((b) => b.id === selectedBookId);
  const selectedChapter = chapters.find((c) => c.id === selectedChapterId);
  const selectedNote = notes.find((n) => n.id === selectedNoteId);

  return (
    <div className="app-container">
      <TitleBar />
      <div className="app-body">
        <Sidebar />
        <ChapterList />
        <NoteEditor />
      </div>
      {showSettings && <SettingsPanel />}
      {showSearch && <SearchOverlay />}
    </div>
  );
}
