import { useState, useCallback, useEffect, useRef } from "react";
import { useUIStore } from "../../store/uiStore";
import { useNoteStore } from "../../store/noteStore";
import { useChapterStore } from "../../store/chapterStore";
import { useBookStore } from "../../store/bookStore";
import { searchNotes } from "../../utils/bridge";
import { FiX, FiSearch } from "react-icons/fi";

interface SearchResult {
  id: string;
  title: string;
  content_preview: string;
  chapter_id: string;
  book_id: string;
  book_title: string;
  chapter_title: string;
}

export default function SearchOverlay() {
  const { setShowSearch } = useUIStore();
  const { selectNote, loadNotes } = useNoteStore();
  const { selectChapter } = useChapterStore();
  const { selectBook } = useBookStore();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<number>();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const res = await searchNotes(q);
      setResults(res);
    } catch (e) {
      console.error("Search failed", e);
    }
    setLoading(false);
  }, []);

  const handleChange = (value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => doSearch(value), 300);
  };

  const handleSelect = (result: SearchResult) => {
    selectBook(result.book_id);
    setTimeout(() => {
      selectChapter(result.chapter_id);
      setTimeout(() => {
        loadNotes(result.chapter_id);
        selectNote(result.id);
        setShowSearch(false);
      }, 50);
    }, 50);
  };

  return (
    <div className="search-overlay" onClick={() => setShowSearch(false)}>
      <div className="search-panel" onClick={(e) => e.stopPropagation()}>
        <div className="search-input-wrapper">
          <FiSearch size={18} className="search-icon" />
          <input
            ref={inputRef}
            type="text"
            className="search-input"
            placeholder="Search entries..."
            value={query}
            onChange={(e) => handleChange(e.target.value)}
            onKeyDown={(e) => e.key === "Escape" && setShowSearch(false)}
          />
          <button
            className="icon-btn"
            onClick={() => setShowSearch(false)}
          >
            <FiX size={18} />
          </button>
        </div>

        {loading && <div className="search-status">Searching...</div>}

        <div className="search-results">
          {results.map((r) => (
            <div
              key={r.id}
              className="search-result-item"
              onClick={() => handleSelect(r)}
            >
              <div className="search-result-title">{r.title}</div>
              <div
                className="search-result-preview"
                dangerouslySetInnerHTML={{ __html: r.content_preview }}
              />
              <div className="search-result-location">
                {r.book_title} / {r.chapter_title}
              </div>
            </div>
          ))}
          {!loading && query && results.length === 0 && (
            <div className="search-status">No results found</div>
          )}
        </div>
      </div>
    </div>
  );
}
