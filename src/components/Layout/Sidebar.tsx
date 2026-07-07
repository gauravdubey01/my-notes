import { useState } from "react";
import { useBookStore, Book } from "../../store/bookStore";
import { FiPlus, FiMoreHorizontal, FiTrash2, FiEdit2 } from "react-icons/fi";

const BOOK_COLORS = [
  "#8B7355", "#C4A882", "#2C5F2D", "#5B7B9A",
  "#9B6B7C", "#D4A574", "#6B7B8D", "#7D6B5B",
];

const BOOK_ICONS = ["📖", "📓", "📕", "📗", "📘", "📙", "📔", "📒"];

export default function Sidebar() {
  const { books, selectedBookId, selectBook, createBook, updateBook, deleteBook } =
    useBookStore();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newColor, setNewColor] = useState(BOOK_COLORS[0]);
  const [newIcon, setNewIcon] = useState(BOOK_ICONS[0]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");

  const handleCreate = async () => {
    if (!newTitle.trim()) return;
    await createBook(newTitle.trim(), newColor, newIcon);
    setNewTitle("");
    setShowAddForm(false);
  };

  const handleRename = async (id: string) => {
    if (editingTitle.trim()) {
      await updateBook(id, { title: editingTitle.trim() });
    }
    setEditingId(null);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Delete this book and all its chapters?")) {
      await deleteBook(id);
    }
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>Books</h2>
        <button className="icon-btn" onClick={() => setShowAddForm(!showAddForm)}>
          <FiPlus size={16} />
        </button>
      </div>

      {showAddForm && (
        <div className="add-form">
          <input
            type="text"
            placeholder="Book title..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            autoFocus
          />
          <div className="color-picker-row">
            {BOOK_COLORS.map((c) => (
              <button
                key={c}
                className={`color-swatch ${newColor === c ? "selected" : ""}`}
                style={{ background: c }}
                onClick={() => setNewColor(c)}
              />
            ))}
          </div>
          <div className="icon-picker-row">
            {BOOK_ICONS.map((ic) => (
              <button
                key={ic}
                className={`icon-option ${newIcon === ic ? "selected" : ""}`}
                onClick={() => setNewIcon(ic)}
              >
                {ic}
              </button>
            ))}
          </div>
          <button className="btn btn-primary" onClick={handleCreate}>
            Create Book
          </button>
        </div>
      )}

      <div className="book-list">
        {books.map((book) => (
          <div
            key={book.id}
            className={`book-item ${selectedBookId === book.id ? "selected" : ""}`}
            onClick={() => selectBook(book.id)}
          >
            <div
              className="book-color-bar"
              style={{ backgroundColor: book.color }}
            />
            <span className="book-icon">{book.icon}</span>
            {editingId === book.id ? (
              <input
                className="book-edit-input"
                value={editingTitle}
                onChange={(e) => setEditingTitle(e.target.value)}
                onBlur={() => handleRename(book.id)}
                onKeyDown={(e) => e.key === "Enter" && handleRename(book.id)}
                autoFocus
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <span className="book-title">{book.title}</span>
            )}
            <div className="book-actions">
              <button
                className="book-action-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingId(book.id);
                  setEditingTitle(book.title);
                }}
              >
                <FiEdit2 size={12} />
              </button>
              <button
                className="book-action-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(book.id);
                }}
              >
                <FiTrash2 size={12} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
