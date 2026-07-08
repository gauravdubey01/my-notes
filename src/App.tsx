import { useEffect, useCallback, useState, useRef } from "react";
import { getVersion } from "@tauri-apps/api/app";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { openUrl } from "@tauri-apps/plugin-opener";
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
import ExitDialog from "./components/UI/ExitDialog";
import TutorialOverlay from "./components/UI/TutorialOverlay";

export default function App() {
  const { books, selectedBookId, selectBook, loadBooks } = useBookStore();
  const { chapters, selectedChapterId, selectChapter, loadChapters } =
    useChapterStore();
  const { notes, selectedNoteId, selectNote, loadNotes } = useNoteStore();
  const { showSettings, showSearch } = useUIStore();
  const [appVersion, setAppVersion] = useState("");
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const exitHandledRef = useRef(false);
  const closeUnlistenRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    getVersion().then(setAppVersion);
  }, []);

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

  useEffect(() => {
    const tutorialSeen = localStorage.getItem("tutorialSeen");
    if (!tutorialSeen) {
      setShowTutorial(true);
    }
  }, []);

  useEffect(() => {
    const setupCloseHandler = async () => {
      const window = getCurrentWindow();
      const unlisten = await window.onCloseRequested(async (event) => {
        if (exitHandledRef.current) {
          return;
        }
        event.preventDefault();
        setShowExitDialog(true);
      });
      closeUnlistenRef.current = unlisten;
    };
    setupCloseHandler();
    return () => {
      closeUnlistenRef.current?.();
    };
  }, []);

  const handleTutorialDismiss = useCallback(() => {
    localStorage.setItem("tutorialSeen", "true");
    setShowTutorial(false);
  }, []);

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
      <div className="app-footer">
        <span className="footer-made">Made by Gaurav Dubey</span>
        <span className="footer-version">v{appVersion}</span>
        <a className="footer-kofi" href="#" onClick={(e) => { e.preventDefault(); openUrl("https://ko-fi.com/gauravdubeypro"); }} title="Support me on Ko-fi">
          ☕ Support on Ko-fi
        </a>
      </div>
      {showSettings && <SettingsPanel />}
      {showSearch && <SearchOverlay />}
      {showExitDialog && <ExitDialog onClose={() => setShowExitDialog(false)} onExit={() => { exitHandledRef.current = true; getCurrentWindow().close(); }} />}
      {showTutorial && <TutorialOverlay onDismiss={handleTutorialDismiss} />}
    </div>
  );
}
