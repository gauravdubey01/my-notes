import { useCallback, useEffect, useState } from "react";
import { useNoteStore } from "../../store/noteStore";
import { useChapterStore } from "../../store/chapterStore";
import { useBookStore } from "../../store/bookStore";
import { formatDate } from "../../utils/db";
import TiptapEditor from "./TiptapEditor";
import {
  FiTrash2,
  FiBookmark,
  FiClock,
  FiDroplet,
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

  useEffect(() => {
    if (note) {
      setTitle(note.title);
    }
  }, [note?.id]);

  const handleTitleBlur = useCallback(() => {
    if (note && title.trim() !== note.title) {
      updateNote(note.id, { title: title.trim() || "Untitled" });
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
    if (note && confirm("Delete this note?")) {
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
          <p>Select a note or create a new one</p>
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
            title="Delete note"
          >
            <FiTrash2 size={14} />
          </button>
        </div>
      </div>

      <input
        className="note-title-input"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onBlur={handleTitleBlur}
        onKeyDown={handleTitleKeyDown}
        placeholder="Note title..."
      />

      <TiptapEditor
        key={note.id}
        content={note.content}
        noteId={note.id}
        onUpdate={(html) => updateNote(note.id, { content: html })}
      />
    </div>
  );
}
