using System;
using System.IO;
using System.Collections.Generic;
using System.Runtime.InteropServices;
using System.Text;

namespace MyNotes
{
    // ——— Data Models ———

    public class Book
    {
        public string id { get; set; } = "";
        public string title { get; set; } = "";
        public string color { get; set; } = "#8B7355";
        public string icon { get; set; } = "\U0001F4D6";
        public int sort_order { get; set; }
        public string created_at { get; set; } = "";
        public string updated_at { get; set; } = "";
        public bool is_archived { get; set; }
    }

    public class Chapter
    {
        public string id { get; set; } = "";
        public string book_id { get; set; } = "";
        public string title { get; set; } = "";
        public string color { get; set; } = "";
        public int sort_order { get; set; }
        public string created_at { get; set; } = "";
        public string updated_at { get; set; } = "";
        public bool is_archived { get; set; }
    }

    public class Note
    {
        public string id { get; set; } = "";
        public string chapter_id { get; set; } = "";
        public string title { get; set; } = "Untitled";
        public string content { get; set; } = "";
        public string color { get; set; } = "";
        public bool is_pinned { get; set; }
        public int sort_order { get; set; }
        public string created_at { get; set; } = "";
        public string updated_at { get; set; } = "";
        public bool is_archived { get; set; }
    }

    public class Tag
    {
        public string id { get; set; } = "";
        public string name { get; set; } = "";
        public string color { get; set; } = "#8B7355";
    }

    public class NoteTag
    {
        public string note_id { get; set; } = "";
        public string tag_id { get; set; } = "";
    }

    public class Setting
    {
        public string key { get; set; } = "";
        public string value { get; set; } = "";
    }

    public class AppData
    {
        public List<Book> books { get; set; } = new List<Book>();
        public List<Chapter> chapters { get; set; } = new List<Chapter>();
        public List<Note> notes { get; set; } = new List<Note>();
        public List<Tag> tags { get; set; } = new List<Tag>();
        public List<NoteTag> note_tags { get; set; } = new List<NoteTag>();
        public List<Setting> settings { get; set; } = new List<Setting>();
    }

    public class SearchResult
    {
        public string id { get; set; } = "";
        public string title { get; set; } = "";
        public string content_preview { get; set; } = "";
        public string chapter_id { get; set; } = "";
        public string book_id { get; set; } = "";
        public string book_title { get; set; } = "";
        public string chapter_title { get; set; } = "";
    }

    // ——— Bridge Object (exposed to JavaScript via WebView2) ———

    [ComVisible(true)]
    public class NotesBridge
    {
        public bool AlwaysOnTop { get; set; }
        public event Action OnRequestClose;
        public event Action OnRequestMinimize;

        private AppData _data;
        private string _dataDir;
        private string _dataPath;

        private static readonly Json _json = new Json();

        public NotesBridge()
        {
            _dataDir = Path.Combine(
                Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
                "MyNotes"
            );
            Directory.CreateDirectory(_dataDir);
            _dataPath = Path.Combine(_dataDir, "data.json");
            _data = Load();
        }

        private AppData Load()
        {
            try
            {
                if (File.Exists(_dataPath))
                    return _json.Parse<AppData>(File.ReadAllText(_dataPath, Encoding.UTF8));
            }
            catch { }
            return new AppData();
        }

        public void Save()
        {
            try
            {
                string json = _json.Stringify(CleanForExport());
                File.WriteAllText(_dataPath, json, Encoding.UTF8);
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine("Save failed: " + ex.Message);
            }
        }

        private AppData CleanForExport()
        {
            return new AppData
            {
                books = _data.books.FindAll(b => !b.is_archived),
                chapters = _data.chapters.FindAll(c => !c.is_archived),
                notes = _data.notes.FindAll(n => !n.is_archived),
                tags = _data.tags,
                note_tags = _data.note_tags,
                settings = _data.settings,
            };
        }

        private static string NewId() => Guid.NewGuid().ToString("D").ToLower();
        private static string Now() => DateTime.UtcNow.ToString("o");

        // ——— Books ———

        public string GetBooks()
        {
            var list = _data.books.FindAll(b => !b.is_archived);
            list.Sort((a, b) => a.sort_order.CompareTo(b.sort_order));
            return _json.Stringify(list);
        }

        public string CreateBook(string title, string color, string icon)
        {
            var book = new Book
            {
                id = NewId(),
                title = title ?? "Untitled",
                color = color ?? "#8B7355",
                icon = icon ?? "\U0001F4D6",
                sort_order = _data.books.Count,
                created_at = Now(),
                updated_at = Now(),
            };
            _data.books.Add(book);
            Save();
            return _json.Stringify(book);
        }

        public string UpdateBook(string id, string updatesJson)
        {
            var book = _data.books.Find(b => b.id == id);
            if (book == null) return "null";
            var updates = _json.Parse<Dictionary<string, object>>(updatesJson);
            if (updates.ContainsKey("title")) book.title = updates["title"]?.ToString() ?? book.title;
            if (updates.ContainsKey("color")) book.color = updates["color"]?.ToString() ?? book.color;
            if (updates.ContainsKey("icon")) book.icon = updates["icon"]?.ToString() ?? book.icon;
            if (updates.ContainsKey("sort_order")) book.sort_order = Convert.ToInt32(updates["sort_order"]);
            book.updated_at = Now();
            Save();
            return _json.Stringify(book);
        }

        public void DeleteBook(string id)
        {
            var book = _data.books.Find(b => b.id == id);
            if (book != null)
            {
                book.is_archived = true;
                book.updated_at = Now();
                foreach (var ch in _data.chapters.FindAll(c => c.book_id == id))
                {
                    ch.is_archived = true;
                    ch.updated_at = Now();
                    foreach (var n in _data.notes.FindAll(no => no.chapter_id == ch.id))
                    {
                        n.is_archived = true;
                        n.updated_at = Now();
                    }
                }
                Save();
            }
        }

        public void ReorderBooks(string idsJson)
        {
            var ids = _json.Parse<List<string>>(idsJson);
            for (int i = 0; i < ids.Count; i++)
            {
                var book = _data.books.Find(b => b.id == ids[i]);
                if (book != null)
                {
                    book.sort_order = i;
                    book.updated_at = Now();
                }
            }
            Save();
        }

        // ——— Chapters ———

        public string GetChapters(string bookId)
        {
            var list = _data.chapters.FindAll(c => c.book_id == bookId && !c.is_archived);
            list.Sort((a, b) => a.sort_order.CompareTo(b.sort_order));
            return _json.Stringify(list);
        }

        public string CreateChapter(string bookId, string title, string color)
        {
            var ch = new Chapter
            {
                id = NewId(),
                book_id = bookId,
                title = title ?? "Untitled",
                color = color ?? "",
                sort_order = _data.chapters.FindAll(c => c.book_id == bookId).Count,
                created_at = Now(),
                updated_at = Now(),
            };
            _data.chapters.Add(ch);
            Save();
            return _json.Stringify(ch);
        }

        public string UpdateChapter(string id, string updatesJson)
        {
            var ch = _data.chapters.Find(c => c.id == id);
            if (ch == null) return "null";
            var updates = _json.Parse<Dictionary<string, object>>(updatesJson);
            if (updates.ContainsKey("title")) ch.title = updates["title"]?.ToString() ?? ch.title;
            if (updates.ContainsKey("color")) ch.color = updates["color"]?.ToString() ?? ch.color;
            ch.updated_at = Now();
            Save();
            return _json.Stringify(ch);
        }

        public void DeleteChapter(string id)
        {
            var ch = _data.chapters.Find(c => c.id == id);
            if (ch != null)
            {
                ch.is_archived = true;
                ch.updated_at = Now();
                foreach (var n in _data.notes.FindAll(no => no.chapter_id == id))
                {
                    n.is_archived = true;
                    n.updated_at = Now();
                }
                Save();
            }
        }

        public void ReorderChapters(string idsJson)
        {
            var ids = _json.Parse<List<string>>(idsJson);
            for (int i = 0; i < ids.Count; i++)
            {
                var ch = _data.chapters.Find(c => c.id == ids[i]);
                if (ch != null)
                {
                    ch.sort_order = i;
                    ch.updated_at = Now();
                }
            }
            Save();
        }

        // ——— Notes ———

        public string GetNotes(string chapterId)
        {
            var list = _data.notes.FindAll(n => n.chapter_id == chapterId && !n.is_archived);
            list.Sort((a, b) =>
            {
                int cmp = b.is_pinned.CompareTo(a.is_pinned);
                return cmp != 0 ? cmp : b.updated_at.CompareTo(a.updated_at);
            });
            return _json.Stringify(list);
        }

        public string CreateNote(string chapterId)
        {
            var note = new Note
            {
                id = NewId(),
                chapter_id = chapterId,
                title = "Untitled",
                content = "",
                sort_order = _data.notes.FindAll(n => n.chapter_id == chapterId).Count,
                created_at = Now(),
                updated_at = Now(),
            };
            _data.notes.Add(note);
            Save();
            return _json.Stringify(note);
        }

        public string UpdateNote(string id, string updatesJson)
        {
            var note = _data.notes.Find(n => n.id == id);
            if (note == null) return "null";
            var updates = _json.Parse<Dictionary<string, object>>(updatesJson);
            if (updates.ContainsKey("title")) note.title = updates["title"]?.ToString() ?? note.title;
            if (updates.ContainsKey("content")) note.content = updates["content"]?.ToString() ?? note.content;
            if (updates.ContainsKey("color"))
            {
                var v = updates["color"];
                note.color = (v == null || v.ToString() == "") ? "" : v.ToString();
            }
            if (updates.ContainsKey("is_pinned")) note.is_pinned = Convert.ToBoolean(updates["is_pinned"]);
            if (updates.ContainsKey("sort_order")) note.sort_order = Convert.ToInt32(updates["sort_order"]);
            note.updated_at = Now();
            Save();
            return _json.Stringify(note);
        }

        public void DeleteNote(string id)
        {
            var note = _data.notes.Find(n => n.id == id);
            if (note != null)
            {
                note.is_archived = true;
                note.updated_at = Now();
                Save();
            }
        }

        // ——— Search ———

        public string SearchNotes(string query)
        {
            if (string.IsNullOrWhiteSpace(query)) return "[]";
            var q = query.ToLowerInvariant();
            var results = new List<SearchResult>();

            foreach (var note in _data.notes.FindAll(n => !n.is_archived))
            {
                if (note.title.ToLowerInvariant().Contains(q) ||
                    note.content.ToLowerInvariant().Contains(q))
                {
                    var ch = _data.chapters.Find(c => c.id == note.chapter_id);
                    var book = ch != null ? _data.books.Find(b => b.id == ch.book_id) : null;
                    if (ch == null || ch.is_archived) continue;
                    if (book == null || book.is_archived) continue;

                    string preview = note.content.Length > 100
                        ? note.content.Substring(0, 100) + "..."
                        : note.content;

                    results.Add(new SearchResult
                    {
                        id = note.id,
                        title = note.title,
                        content_preview = preview,
                        chapter_id = note.chapter_id,
                        book_id = book.id,
                        book_title = book.title,
                        chapter_title = ch.title,
                    });
                }
            }

            results.Sort((a, b) => b.title.CompareTo(a.title));
            if (results.Count > 50) results = results.GetRange(0, 50);
            return _json.Stringify(results);
        }

        // ——— Window Controls ———

        public bool TogglePin()
        {
            AlwaysOnTop = !AlwaysOnTop;
            return AlwaysOnTop;
        }

        public bool GetPinState() => AlwaysOnTop;

        public void CloseWindow() => OnRequestClose?.Invoke();
        public void MinimizeWindow() => OnRequestMinimize?.Invoke();

        // ——— Backup ———

        public string ExportBackup()
        {
            return _json.Stringify(CleanForExport());
        }

        public void ImportBackup(string json)
        {
            try
            {
                var incoming = _json.Parse<AppData>(json);
                foreach (var b in incoming.books) b.is_archived = false;
                foreach (var c in incoming.chapters) c.is_archived = false;
                foreach (var n in incoming.notes) n.is_archived = false;

                _data.books.AddRange(incoming.books);
                _data.chapters.AddRange(incoming.chapters);
                _data.notes.AddRange(incoming.notes);
                _data.tags.AddRange(incoming.tags);
                _data.note_tags.AddRange(incoming.note_tags);

                foreach (var s in incoming.settings)
                {
                    var exist = _data.settings.Find(x => x.key == s.key);
                    if (exist != null) exist.value = s.value;
                    else _data.settings.Add(s);
                }
                Save();
            }
            catch (Exception ex)
            {
                throw new Exception("Import failed: " + ex.Message);
            }
        }
    }

    // ——— Minimal JSON parser/serializer (no external dependencies) ———

    public class Json
    {
        public T Parse<T>(string json) where T : class
        {
            var t = typeof(T);
            var obj = ParseValue(json, 0, out _);
            return (T)ConvertToType(obj, t);
        }

        public string Stringify(object obj)
        {
            return StringifyValue(obj);
        }

        private string StringifyValue(object v)
        {
            if (v == null) return "null";
            if (v is string s) return "\"" + Escape(s) + "\"";
            if (v is bool b) return b ? "true" : "false";
            if (v is int || v is long || v is float || v is double || v is decimal)
                return v.ToString().Replace(',', '.');
            if (v is System.Collections.IList list)
            {
                var items = new List<string>();
                foreach (var item in list) items.Add(StringifyValue(item));
                return "[" + string.Join(",", items) + "]";
            }
            if (v is System.Collections.IDictionary dict)
            {
                var entries = new List<string>();
                foreach (var key in dict.Keys)
                    entries.Add("\"" + Escape(key.ToString()) + "\":" + StringifyValue(dict[key]));
                return "{" + string.Join(",", entries) + "}";
            }
            // Fallback: use reflection for plain objects
            var props = new List<string>();
            foreach (var prop in v.GetType().GetProperties())
            {
                var val = prop.GetValue(v);
                props.Add("\"" + Escape(prop.Name) + "\":" + StringifyValue(val));
            }
            return "{" + string.Join(",", props) + "}";
        }

        private static string Escape(string s) =>
            s.Replace("\\", "\\\\").Replace("\"", "\\\"").Replace("\n", "\\n").Replace("\r", "\\r")
             .Replace("\t", "\\t");

        private object ParseValue(string json, int pos, out int end)
        {
            pos = SkipWS(json, pos);
            if (pos >= json.Length) { end = pos; return null; }
            char c = json[pos];
            if (c == '{') return ParseObject(json, pos, out end);
            if (c == '[') return ParseArray(json, pos, out end);
            if (c == '"') return ParseString(json, pos, out end);
            if (c == 't' || c == 'f') { end = pos + (c == 't' ? 4 : 5); return c == 't'; }
            if (c == 'n') { end = pos + 4; return null; }
            return ParseNumber(json, pos, out end);
        }

        private Dictionary<string, object> ParseObject(string json, int pos, out int end)
        {
            var obj = new Dictionary<string, object>();
            pos = SkipWS(json, pos + 1);
            if (pos < json.Length && json[pos] == '}') { end = pos + 1; return obj; }
            while (pos < json.Length)
            {
                pos = SkipWS(json, pos);
                var key = (string)ParseValue(json, pos, out pos);
                pos = SkipWS(json, pos);
                if (pos < json.Length && json[pos] == ':') pos++;
                var val = ParseValue(json, pos, out pos);
                obj[key] = val;
                pos = SkipWS(json, pos);
                if (pos < json.Length && json[pos] == ',') pos++;
                pos = SkipWS(json, pos);
                if (pos < json.Length && json[pos] == '}') { end = pos + 1; return obj; }
            }
            end = pos;
            return obj;
        }

        private List<object> ParseArray(string json, int pos, out int end)
        {
            var list = new List<object>();
            pos = SkipWS(json, pos + 1);
            if (pos < json.Length && json[pos] == ']') { end = pos + 1; return list; }
            while (pos < json.Length)
            {
                list.Add(ParseValue(json, pos, out pos));
                pos = SkipWS(json, pos);
                if (pos < json.Length && json[pos] == ',') pos++;
                pos = SkipWS(json, pos);
                if (pos < json.Length && json[pos] == ']') { end = pos + 1; return list; }
            }
            end = pos;
            return list;
        }

        private string ParseString(string json, int pos, out int end)
        {
            pos++;
            var sb = new System.Text.StringBuilder();
            while (pos < json.Length)
            {
                char c = json[pos++];
                if (c == '"') { end = pos; return sb.ToString(); }
                if (c == '\\')
                {
                    if (pos >= json.Length) break;
                    char n = json[pos++];
                    if (n == '"') sb.Append('"');
                    else if (n == '\\') sb.Append('\\');
                    else if (n == '/') sb.Append('/');
                    else if (n == 'n') sb.Append('\n');
                    else if (n == 'r') sb.Append('\r');
                    else if (n == 't') sb.Append('\t');
                    else if (n == 'u' && pos + 4 <= json.Length)
                    {
                        var hex = json.Substring(pos, 4);
                        sb.Append((char)Convert.ToInt32(hex, 16));
                        pos += 4;
                    }
                    else sb.Append(n);
                }
                else sb.Append(c);
            }
            end = pos;
            return sb.ToString();
        }

        private object ParseNumber(string json, int pos, out int end)
        {
            int start = pos;
            if (json[pos] == '-') pos++;
            while (pos < json.Length && char.IsDigit(json[pos])) pos++;
            bool isFloat = false;
            if (pos < json.Length && json[pos] == '.')
            {
                isFloat = true; pos++;
                while (pos < json.Length && char.IsDigit(json[pos])) pos++;
            }
            if (pos < json.Length && (json[pos] == 'e' || json[pos] == 'E'))
            {
                isFloat = true; pos++;
                if (pos < json.Length && (json[pos] == '+' || json[pos] == '-')) pos++;
                while (pos < json.Length && char.IsDigit(json[pos])) pos++;
            }
            end = pos;
            string num = json.Substring(start, pos - start);
            if (isFloat) return double.Parse(num, System.Globalization.CultureInfo.InvariantCulture);
            if (long.TryParse(num, out long l)) return l;
            return double.Parse(num, System.Globalization.CultureInfo.InvariantCulture);
        }

        private int SkipWS(string json, int pos)
        {
            while (pos < json.Length && (json[pos] == ' ' || json[pos] == '\t' ||
                   json[pos] == '\n' || json[pos] == '\r')) pos++;
            return pos;
        }

        private object ConvertToType(object val, Type target)
        {
            if (val == null) return null;
            if (target == typeof(string)) return val.ToString();
            if (target == typeof(int)) return Convert.ToInt32(val);
            if (target == typeof(long)) return Convert.ToInt64(val);
            if (target == typeof(bool)) return Convert.ToBoolean(val);
            if (target == typeof(double)) return Convert.ToDouble(val);
            if (target.IsGenericType && target.GetGenericTypeDefinition() == typeof(List<>))
            {
                var listType = target.GetGenericArguments()[0];
                var list = (System.Collections.IList)Activator.CreateInstance(target);
                if (val is System.Collections.IList srcList)
                    foreach (var item in srcList)
                        list.Add(ConvertToType(item, listType));
                return list;
            }
            if (val is Dictionary<string, object> dict)
            {
                var obj = Activator.CreateInstance(target);
                foreach (var prop in target.GetProperties())
                {
                    if (dict.TryGetValue(prop.Name, out object pv))
                    {
                        if (pv == null) continue;
                        var converted = ConvertToType(pv, prop.PropertyType);
                        prop.SetValue(obj, converted);
                    }
                }
                return obj;
            }
            return val;
        }
    }
}
