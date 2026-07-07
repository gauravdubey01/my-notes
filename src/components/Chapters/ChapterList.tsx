import { useState } from "react";
import { useBookStore } from "../../store/bookStore";
import { useChapterStore, Chapter } from "../../store/chapterStore";
import { useNoteStore } from "../../store/noteStore";
import { FiPlus, FiTrash2, FiEdit2, FiFile } from "react-icons/fi";

const CHAPTER_COLORS = [
  "#8B7355", "#C4A882", "#2C5F2D", "#5B7B9A",
  "#9B6B7C", "#D4A574", "#6B7B8D", "#7D6B5B",
];

export default function ChapterList() {
  const { selectedBookId, books } = useBookStore();
  const {
    chapters,
    selectedChapterId,
    selectChapter,
    createChapter,
    updateChapter,
    deleteChapter,
  } = useChapterStore();
  const { notes, selectedNoteId, selectNote, createNote } = useNoteStore();
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newColor, setNewColor] = useState<string | undefined>(undefined);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");

  const selectedBook = books.find((b) => b.id === selectedBookId);

  const handleCreate = async () => {
    if (!newTitle.trim() || !selectedBookId) return;
    await createChapter(selectedBookId, newTitle.trim(), newColor);
    setNewTitle("");
    setNewColor(undefined);
    setShowAdd(false);
  };

  const handleRename = async (id: string) => {
    if (editingTitle.trim()) {
      await updateChapter(id, { title: editingTitle.trim() });
    }
    setEditingId(null);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Delete this chapter and all its entries?")) {
      await deleteChapter(id);
    }
  };

  if (!selectedBook) {
    return (
      <div className="chapter-list empty-state">
        <div className="empty-content">
          <span className="empty-icon">📖</span>
          <p>Select or create a journal to begin</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chapter-list">
      <div className="chapter-list-header">
        <div className="chapter-list-title">
          <span className="chapter-book-icon">{selectedBook.icon}</span>
          <h2>{selectedBook.title}</h2>
        </div>
        <button className="icon-btn" onClick={() => setShowAdd(!showAdd)}>
          <FiPlus size={16} />
        </button>
      </div>

      {showAdd && (
        <div className="add-form">
          <input
            type="text"
            placeholder="Chapter title..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            autoFocus
          />
          <div className="color-picker-row">
            <button
              className={`color-swatch ${!newColor ? "selected" : ""}`}
              style={{ background: selectedBook.color }}
              onClick={() => setNewColor(undefined)}
              title="Use book color"
            />
            {CHAPTER_COLORS.map((c) => (
              <button
                key={c}
                className={`color-swatch ${newColor === c ? "selected" : ""}`}
                style={{ background: c }}
                onClick={() => setNewColor(c)}
              />
            ))}
          </div>
          <button className="btn btn-primary" onClick={handleCreate}>
            Create Chapter
          </button>
        </div>
      )}

      <div className="chapters">
        {chapters.map((chapter) => (
          <div key={chapter.id} className="chapter-group">
            <div
              className={`chapter-item ${
                selectedChapterId === chapter.id ? "selected" : ""
              }`}
              onClick={() => selectChapter(chapter.id)}
            >
              <div
                className="chapter-color-dot"
                style={{
                  backgroundColor: chapter.color || selectedBook.color,
                }}
              />
              <div className="chapter-content">
                {editingId === chapter.id ? (
                  <input
                    className="chapter-edit-input"
                    value={editingTitle}
                    onChange={(e) => setEditingTitle(e.target.value)}
                    onBlur={() => handleRename(chapter.id)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && handleRename(chapter.id)
                    }
                    autoFocus
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <span className="chapter-title">{chapter.title}</span>
                )}
                <span className="chapter-count">
                  {notes.filter((n) => n.chapter_id === chapter.id).length} entries
                </span>
              </div>
              <div className="chapter-actions">
                <button
                  className="chapter-action-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingId(chapter.id);
                    setEditingTitle(chapter.title);
                  }}
                  title="Rename"
                >
                  <FiEdit2 size={12} />
                </button>
                <button
                  className="chapter-action-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(chapter.id);
                  }}
                  title="Delete"
                >
                  <FiTrash2 size={12} />
                </button>
              </div>
            </div>

            {selectedChapterId === chapter.id && (
              <div className="note-list">
                {notes
                  .filter((n) => n.chapter_id === chapter.id)
                  .map((note) => (
                    <div
                      key={note.id}
                      className={`note-item ${
                        selectedNoteId === note.id ? "selected" : ""
                      }`}
                      onClick={() => selectNote(note.id)}
                    >
                      <FiFile size={14} />
                      <span className="note-item-title">{note.title}</span>
                      {note.is_pinned && <span className="pinned-badge">📌</span>}
                    </div>
                  ))}
                <button
                  className="add-note-btn"
                  onClick={() => createNote(chapter.id)}
                >
                  <FiPlus size={14} /> New entry
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
