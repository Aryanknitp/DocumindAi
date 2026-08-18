import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FileText, Grid3X3, List, Search, SlidersHorizontal, Plus,
  MoreVertical, Heart, Share2, Trash2, Download, Edit3,
  FolderOpen, Star, Clock
} from 'lucide-react'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'
import Badge from '../../components/ui/Badge'

function DocumentCard({ view }) {
  // Backend-ready: cards rendered when data arrives from API
  return null
}

export default function Documents({ title = 'My Documents', emptyTitle = 'No documents yet', emptyDesc = 'Upload your first PDF to get started. Your documents will appear here.' }) {
  const navigate = useNavigate()
  const [view, setView] = useState('grid')
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const [filterOpen, setFilterOpen] = useState(false)

  // Documents loaded from backend API — empty state until backend integrated
  const documents = []
  const filtered = documents.filter(d =>
    d.name?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">{title}</h1>
          <p className="text-sm text-[var(--muted-foreground)]">
            {documents.length ? `${documents.length} document${documents.length !== 1 ? 's' : ''}` : 'No documents'}
          </p>
        </div>
        <Button variant="gradient" size="md" onClick={() => navigate('/upload')}>
          <Plus size={15} /> Upload PDF
        </Button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] pointer-events-none" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search documents..."
            className="w-full h-9 pl-9 pr-4 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--card)] text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
          />
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="h-9 px-3 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--card)] text-sm text-[var(--foreground)] focus:outline-none"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="name">Name A–Z</option>
            <option value="size">Size</option>
          </select>

          <button
            onClick={() => setFilterOpen(v => !v)}
            className={`h-9 w-9 flex items-center justify-center rounded-[var(--radius)] border transition-colors ${filterOpen ? 'border-[var(--primary)] bg-[var(--secondary)] text-[var(--primary)]' : 'border-[var(--border)] bg-[var(--card)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]'}`}
          >
            <SlidersHorizontal size={15} />
          </button>

          <div className="flex border border-[var(--border)] rounded-[var(--radius)] overflow-hidden">
            {[
              { id: 'grid', Icon: Grid3X3 },
              { id: 'list', Icon: List },
            ].map(({ id, Icon }) => (
              <button
                key={id}
                onClick={() => setView(id)}
                className={`h-9 w-9 flex items-center justify-center transition-colors ${view === id ? 'bg-[var(--secondary)] text-[var(--primary)]' : 'bg-[var(--card)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]'}`}
              >
                <Icon size={15} />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Filters */}
      {filterOpen && (
        <div className="flex flex-wrap gap-2 p-3 bg-[var(--card)] border border-[var(--border)] rounded-xl animate-fade-in">
          <p className="text-xs font-medium text-[var(--muted-foreground)] self-center">Filter by type:</p>
          {['All', 'PDF', 'DOCX', 'TXT'].map(type => (
            <button key={type} className="px-3 py-1 rounded-full text-xs border border-[var(--border)] bg-[var(--muted)] hover:border-[var(--primary)]/50 text-[var(--foreground)] transition-colors">
              {type}
            </button>
          ))}
          <div className="w-px bg-[var(--border)] mx-1" />
          <p className="text-xs font-medium text-[var(--muted-foreground)] self-center">Status:</p>
          {['Processed', 'Processing', 'Failed'].map(s => (
            <button key={s} className="px-3 py-1 rounded-full text-xs border border-[var(--border)] bg-[var(--muted)] hover:border-[var(--primary)]/50 text-[var(--foreground)] transition-colors">
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      <div>
        {filtered.length === 0 ? (
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl">
            <EmptyState
              icon={FileText}
              title={search ? 'No documents match your search' : emptyTitle}
              description={search ? 'Try a different search term.' : emptyDesc}
              action={() => navigate('/upload')}
              actionLabel="Upload PDF"
              secondaryAction={search ? () => setSearch('') : undefined}
              secondaryLabel="Clear search"
            />
          </div>
        ) : view === 'grid' ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map(doc => (
              <DocumentCard key={doc.id} doc={doc} view="grid" />
            ))}
          </div>
        ) : (
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl divide-y divide-[var(--border)]">
            {filtered.map(doc => (
              <DocumentCard key={doc.id} doc={doc} view="list" />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
