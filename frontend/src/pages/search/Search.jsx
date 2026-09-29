import { useState } from "react";
import {
  Search as SearchIcon,
  Filter,
  FileText,
  MessageSquare,
  Sparkles,
  StickyNote,
  Bookmark,
  X,
} from "lucide-react";
import EmptyState from "../../components/ui/EmptyState";
import { apiRequest } from "../../lib/api";

const categories = [
  { id: "all", label: "All", icon: SearchIcon },
  { id: "Documents", label: "Documents", icon: FileText },
  { id: "chats", label: "Chats", icon: MessageSquare },
  { id: "summaries", label: "Summaries", icon: Sparkles },
  { id: "notes", label: "Notes", icon: StickyNote },
  { id: "bookmarks", label: "Bookmarks", icon: Bookmark },
];

export default function Search() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [hasSearched, setHasSearched] = useState(false);

  const [results, setResults] = useState([]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setHasSearched(true);
    try {
      const response = await apiRequest(`/pipeline/search`, {
        method: "POST",
        body: { query },
      });
      setResults(response.results || []);
    } catch (error) {
      setResults([]);
      console.error("Search failed", error);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Search</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Semantic search across all your documents, chats, and notes
        </p>
      </div>

      {/* Search input */}
      <form onSubmit={handleSearch}>
        <div className="relative">
          <SearchIcon
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search anything across your documents..."
            className="w-full h-12 pl-11 pr-12 rounded-xl border border-border bg-card placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-base transition-all"
            autoFocus
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setHasSearched(false);
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </form>

      {/* Category tabs */}
      <div className="flex gap-2 flex-wrap">
        {categories.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setCategory(id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
              category === id
                ? "bg-primary text-primary-foreground"
                : "bg-card border border-border text-muted-foreground hover:bg-muted"
            }`}
          >
            <Icon size={13} /> {label}
          </button>
        ))}
      </div>

      {/* Results */}
      <div>
        {!hasSearched ? (
          <EmptyState
            icon={SearchIcon}
            title="Search your knowledge base"
            description="Type to search across documents, AI chat history, summaries, notes, and bookmarks."
          />
        ) : results.length === 0 ? (
          <EmptyState
            icon={SearchIcon}
            title={`No results for "${query}"`}
            description="Try different keywords or broaden your search category."
            action={() => {
              setQuery("");
              setHasSearched(false);
            }}
            actionLabel="Clear search"
          />
        ) : (
          <div className="space-y-3">
            {results.map((r) => (
              <div
                key={r.id}
                className="bg-card border border-border rounded-xl p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {r.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {r.type}
                    </p>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-secondary text-primary">
                    Match
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  {r.preview}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
