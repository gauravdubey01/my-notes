import { useCallback, useState } from "react";
import { togglePin, getPinState } from "../../utils/bridge";
import { useUIStore } from "../../store/uiStore";
import { useBookStore } from "../../store/bookStore";
import { FiSearch, FiSettings, FiBookmark, FiPlus } from "react-icons/fi";

export default function TitleBar() {
  const { isPinned, setPinned, setShowSearch, setShowSettings } = useUIStore();
  const { selectedBookId } = useBookStore();

  const handleTogglePin = useCallback(async () => {
    try {
      const pinned = await togglePin();
      setPinned(pinned);
    } catch (e) {
      console.error("Pin toggle failed", e);
    }
  }, [setPinned]);

  return (
    <div className="title-bar">
      <div className="title-bar-left">
        <span className="app-logo">📖</span>
        <h1 className="app-title">My Notes</h1>
      </div>
      <div className="title-bar-center">
        {selectedBookId && (
          <button
            className="title-btn"
            onClick={() => setShowSearch(true)}
            title="Search notes"
          >
            <FiSearch size={16} />
          </button>
        )}
        <button
          className={`title-btn ${isPinned ? "active" : ""}`}
          onClick={handleTogglePin}
          title={isPinned ? "Unpin from top" : "Pin to top"}
        >
          <FiBookmark size={16} />
        </button>
        <button
          className="title-btn"
          onClick={() => setShowSettings(true)}
          title="Settings"
        >
          <FiSettings size={16} />
        </button>
      </div>
    </div>
  );
}
