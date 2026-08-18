import { useState } from 'react'
import { Search as SearchIcon, Filter, FileText, MessageSquare, Sparkles, StickyNote, Bookmark, X } from 'lucide-react'
import EmptyState from '../../components/ui/EmptyState'

const categories = [
  { id: 'all', label: 'All', icon: SearchIcon },
  { id: 'pdfs', label: 'PDFs', icon: FileText },
  { id: 'chats', label: 'Chats', icon: MessageSquare },
  { id: 'summaries', label: 'Summaries', icon: Sparkles },
  { id: 'notes', label: 'Notes', icon: StickyNote },
  { id: 'bookmarks', label: 'Bookmarks', icon: Bookmark },
]

export default function Search() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('all')
  const [hasSearched, setHasSearched] = useState(false)

  const handleSearch = (e) => {
    e.preventDefault()
    if (query.trim()) setHasSearched(true)
  }

  const results = [] // Populated from backend API

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Search</h1>
        <p className="text-sm text-[var(--muted-foreground)] mt-1">Semantic search across all your documents, chats, and notes</p>
      </div>

      {/* Search input */}
      <form onSubmit={handleSearch}>
        <div className="relative">
          <SearchIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] pointer-events-none" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search anything across your documents..."
            className="w-full h-12 pl-11 pr-12 rounded-xl border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] text-base transition-all"
            autoFocus
          />
          {query && (
            <button type="button" onClick={() => { setQuery(''); setHasSearched(false) }} className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
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
                ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
                : 'bg-[var(--card)] border border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
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
            action={() => { setQuery(''); setHasSearched(false) }}
            actionLabel="Clear search"
          />
        ) : (
          <div className="space-y-3">
            {results.map(r => (
              <div key={r.id} className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4">
                {/* Result items rendered from API data */}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
