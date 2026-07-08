import { useCallback, useEffect, useRef, useState } from "react";
import { useNoteStore } from "../../store/noteStore";
import { useChapterStore } from "../../store/chapterStore";
import { useBookStore } from "../../store/bookStore";
import { formatDate } from "../../utils/db";
import TiptapEditor, { TiptapEditorHandle } from "./TiptapEditor";
import {
  FiTrash2,
  FiBookmark,
  FiClock,
  FiDroplet,
  FiSave,
} from "react-icons/fi";

const HIGHLIGHT_COLORS = [
  null,
  "#FFF3CD",
  "#FFD6D6",
  "#D4EDDA",
  "#D6E8FF",
  "#E8D6FF",
  "#FFE0B2",
  "#B2DFDB",
];

export default function NoteEditor() {
  const { notes, selectedNoteId, updateNote, deleteNote, togglePin } =
    useNoteStore();
  const { chapters } = useChapterStore();
  const { books } = useBookStore();

  const note = notes.find((n) => n.id === selectedNoteId);
  const chapter = chapters.find((c) => c.id === note?.chapter_id);
  const book = books.find((b) => b.id === chapter?.book_id);

  const [title, setTitle] = useState("");
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const editorRef = useRef<TiptapEditorHandle>(null);
  const pendingTitleRef = useRef("");

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      pendingTitleRef.current = note.title;
      setSaveStatus(null);
    }
  }, [note?.id]);

  const doSave = useCallback(async () => {
    if (!note) return;
    const content = editorRef.current?.getHTML() ?? note.content;
    const noteTitle = pendingTitleRef.current.trim() || "Untitled";
    try {
      setSaveStatus("Saving...");
      await updateNote(note.id, { content, title: noteTitle });
      setSaveStatus("Saved");
    } catch {
      setSaveStatus("Save failed");
    }
    setTimeout(() => setSaveStatus(null), 2000);
  }, [note, updateNote]);

  useEffect(() => {
    if (!note) return;
    return () => {
      const html = editorRef.current?.getHTML();
      const currentTitle = pendingTitleRef.current.trim() || "Untitled";
      if (html !== undefined && (html !== note.content || currentTitle !== note.title)) {
        updateNote(note.id, { content: html, title: currentTitle });
      }
    };
  }, [note?.id]);

  const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    pendingTitleRef.current = e.target.value;
  }, []);

  const handleTitleBlur = useCallback(() => {
    if (!note) return;
    const newTitle = title.trim() || "Untitled";
    if (newTitle !== note.title) {
      updateNote(note.id, { title: newTitle });
    }
  }, [note, title, updateNote]);

  const handleTitleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        (e.target as HTMLInputElement).blur();
      }
    },
    []
  );

  const handleDelete = useCallback(() => {
    if (note && confirm("Delete this entry?")) {
      deleteNote(note.id);
    }
  }, [note, deleteNote]);

  const handleColorChange = useCallback(
    (color: string | null) => {
      if (note) {
        updateNote(note.id, { color });
        setShowColorPicker(false);
      }
    },
    [note, updateNote]
  );

  if (!note) {
    return (
      <div className="note-editor empty-state">
        <div className="empty-content">
          <span className="empty-icon">✍️</span>
          <p>Select an entry or create a new one</p>
        </div>
      </div>
    );
  }

  return (
    <div className="note-editor">
      <div className="editor-toolbar">
        <div className="editor-meta">
          {book && <span className="meta-breadcrumb">{book.icon} {book.title}</span>}
          {chapter && <span className="meta-sep">/</span>}
          {chapter && <span className="meta-breadcrumb">{chapter.title}</span>}
          <span className="meta-sep">·</span>
          <FiClock size={12} />
          <span className="meta-date">{formatDate(note.updated_at)}</span>
        </div>
        <div className="editor-actions">
          <button
            className="editor-action-btn"
            onClick={doSave}
            title="Save (Ctrl+S)"
          >
            <FiSave size={14} />
          </button>
          {saveStatus && (
            <span className={`save-status ${saveStatus === "Saved" ? "saved" : saveStatus === "Saving..." ? "saving" : "error"}`}>
              {saveStatus}
            </span>
          )}
          <div className="color-picker-wrapper">
            <button
              className={`editor-action-btn ${note.color ? "has-color" : ""}`}
              onClick={() => setShowColorPicker(!showColorPicker)}
              title="Highlight color"
              style={
                note.color
                  ? { backgroundColor: note.color }
                  : undefined
              }
            >
              <FiDroplet size={14} />
            </button>
            {showColorPicker && (
              <div className="color-picker-dropdown">
                {HIGHLIGHT_COLORS.map((c, i) => (
                  <button
                    key={i}
                    className={`color-opt ${note.color === c ? "selected" : ""}`}
                    style={c ? { background: c } : undefined}
                    onClick={() => handleColorChange(c)}
                    title={c || "No color"}
                  >
                    {!c && "⊘"}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            className={`editor-action-btn ${note.is_pinned ? "active" : ""}`}
            onClick={() => togglePin(note.id)}
            title={note.is_pinned ? "Unpin" : "Pin"}
          >
            <FiBookmark size={14} />
          </button>
          <button
            className="editor-action-btn danger"
            onClick={handleDelete}
            title="Delete entry"
          >
            <FiTrash2 size={14} />
          </button>
        </div>
      </div>

      <input
        className="note-title-input"
        value={title}
        onChange={handleTitleChange}
        onBlur={handleTitleBlur}
        onKeyDown={handleTitleKeyDown}
        placeholder="Entry title..."
      />

      <TiptapEditor
        ref={editorRef}
        content={note.content}
        noteId={note.id}
      />
    </div>
  );
}
