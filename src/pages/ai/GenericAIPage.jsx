import { useLocation } from 'react-router-dom'
import { Brain, Sparkles, Map, StickyNote, HelpCircle, Highlighter, Bookmark } from 'lucide-react'
import EmptyState from '../../components/ui/EmptyState'

const pageConfig = {
  '/quiz': { icon: Brain, title: 'Quiz Generator', desc: 'Auto-generate quizzes from your PDF documents to test comprehension.', emptyTitle: 'No quizzes generated', emptyDesc: 'Select a document and generate a quiz to test your knowledge.' },
  '/mindmaps': { icon: Map, title: 'Mind Maps', desc: 'Visualize document structure and key concepts with AI-generated mind maps.', emptyTitle: 'No mind maps yet', emptyDesc: 'Generate a mind map from any of your uploaded documents.' },
  '/notes': { icon: StickyNote, title: 'Smart Notes', desc: 'AI-assisted notes that highlight key points and organize your thoughts.', emptyTitle: 'No notes yet', emptyDesc: 'Notes you create while reading PDFs will appear here.' },
  '/highlights': { icon: Highlighter, title: 'Highlights', desc: 'All your highlighted text across documents in one place.', emptyTitle: 'No highlights yet', emptyDesc: 'Highlight text while reading PDFs and they will appear here.' },
  '/bookmarks': { icon: Bookmark, title: 'Bookmarks', desc: 'Saved pages and important sections from your documents.', emptyTitle: 'No bookmarks yet', emptyDesc: 'Bookmark important pages while reading to revisit them quickly.' },
  '/help': { icon: HelpCircle, title: 'Help Center', desc: 'Documentation, tutorials, and support resources.', emptyTitle: 'Help documentation loading', emptyDesc: 'Help articles will be available after backend integration.' },
  '/storage': { icon: Brain, title: 'Storage', desc: 'Manage your document storage and usage.', emptyTitle: 'Storage data unavailable', emptyDesc: 'Storage analytics will appear after backend integration.' },
  '/billing': { icon: Sparkles, title: 'Billing', desc: 'Manage your subscription and billing information.', emptyTitle: 'No billing data', emptyDesc: 'Billing history and subscription details will appear after backend integration.' },
  '/trash': { icon: Sparkles, title: 'Trash', desc: 'Deleted documents are stored here for 30 days.', emptyTitle: 'Trash is empty', emptyDesc: 'Deleted documents will appear here before being permanently removed.' },
  '/collections': { icon: Brain, title: 'Collections', desc: 'Organize your documents into curated collections.', emptyTitle: 'No collections yet', emptyDesc: 'Create collections to organize your documents by topic or project.' },
  '/shared': { icon: Sparkles, title: 'Shared Documents', desc: 'Documents shared with you or by you.', emptyTitle: 'No shared documents', emptyDesc: 'Documents shared with you or that you have shared will appear here.' },
  '/favorites': { icon: Sparkles, title: 'Favorites', desc: 'Your starred documents for quick access.', emptyTitle: 'No favorites yet', emptyDesc: 'Star documents to add them to your favorites for quick access.' },
  '/viewer': { icon: Brain, title: 'PDF Viewer', desc: 'View and annotate your PDF documents.', emptyTitle: 'No document selected', emptyDesc: 'Select a document from your library to open it in the viewer.' },
}

export default function GenericAIPage() {
  const { pathname } = useLocation()
  const config = pageConfig[pathname] || {
    icon: Sparkles,
    title: 'Coming Soon',
    desc: 'This feature is being built.',
    emptyTitle: 'Feature unavailable',
    emptyDesc: 'This page will be available after backend integration.',
  }
  const { icon: Icon, title, desc, emptyTitle, emptyDesc } = config

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">{title}</h1>
        <p className="text-sm text-[var(--muted-foreground)] mt-1">{desc}</p>
      </div>
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl">
        <EmptyState icon={Icon} title={emptyTitle} description={emptyDesc} />
      </div>
    </div>
  )
}
