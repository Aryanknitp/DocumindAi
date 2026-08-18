import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Upload, FileText, Sparkles, MessageSquare,
  BookOpen, HelpCircle as Quiz, Map, StickyNote, Highlighter,
  Bookmark, Search, FolderOpen, Share2, Heart, Clock, Trash2,
  HardDrive, User, Settings, CreditCard, LifeBuoy, LogOut,
  ChevronLeft, ChevronRight, Brain, X
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import Avatar from '../ui/Avatar'

const navGroups = [
  {
    label: 'Main',
    items: [
      { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/upload', icon: Upload, label: 'Upload PDF' },
    ]
  },
  {
    label: 'Documents',
    items: [
      { to: '/documents', icon: FileText, label: 'My Documents' },
      { to: '/recent', icon: Clock, label: 'Recent' },
      { to: '/favorites', icon: Heart, label: 'Favorites' },
      { to: '/shared', icon: Share2, label: 'Shared' },
      { to: '/collections', icon: FolderOpen, label: 'Collections' },
      { to: '/trash', icon: Trash2, label: 'Trash' },
    ]
  },
  {
    label: 'AI Tools',
    items: [
      { to: '/ai-summary', icon: Sparkles, label: 'AI Summaries' },
      { to: '/chat', icon: MessageSquare, label: 'Chat with PDF' },
      { to: '/flashcards', icon: BookOpen, label: 'Flashcards' },
      { to: '/quiz', icon: Quiz, label: 'Quiz Generator' },
      { to: '/mindmaps', icon: Map, label: 'Mind Maps' },
      { to: '/notes', icon: StickyNote, label: 'Smart Notes' },
    ]
  },
  {
    label: 'Annotations',
    items: [
      { to: '/highlights', icon: Highlighter, label: 'Highlights' },
      { to: '/bookmarks', icon: Bookmark, label: 'Bookmarks' },
      { to: '/search', icon: Search, label: 'Search' },
    ]
  },
  {
    label: 'Account',
    items: [
      { to: '/storage', icon: HardDrive, label: 'Storage' },
      { to: '/profile', icon: User, label: 'Profile' },
      { to: '/settings', icon: Settings, label: 'Settings' },
      { to: '/billing', icon: CreditCard, label: 'Billing' },
      { to: '/help', icon: LifeBuoy, label: 'Help Center' },
    ]
  }
]

export default function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={`flex items-center gap-3 px-4 py-5 ${collapsed ? 'justify-center' : ''}`}>
        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center flex-shrink-0">
          <Brain size={18} className="text-white" />
        </div>
        {!collapsed && (
          <span className="font-semibold text-lg text-[var(--foreground)] tracking-tight">
            DocuMind <span className="text-[var(--primary)]">AI</span>
          </span>
        )}
        {!collapsed && (
          <button
            onClick={onToggle}
            className="ml-auto text-[var(--muted-foreground)] hover:text-[var(--foreground)] hidden lg:flex"
          >
            <ChevronLeft size={16} />
          </button>
        )}
        {/* Mobile close */}
        <button onClick={onMobileClose} className="ml-auto text-[var(--muted-foreground)] lg:hidden">
          <X size={18} />
        </button>
      </div>

      {collapsed && (
        <button
          onClick={onToggle}
          className="flex justify-center p-2 text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
        >
          <ChevronRight size={16} />
        </button>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-5">
        {navGroups.map(group => (
          <div key={group.label}>
            {!collapsed && (
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--muted-foreground)] px-2 mb-1">
                {group.label}
              </p>
            )}
            <div className="space-y-0.5">
              {group.items.map(({ to, icon: Icon, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={onMobileClose}
                  className={({ isActive }) => `
                    flex items-center gap-3 px-2 py-2 rounded-[var(--radius)] text-sm transition-all duration-150
                    ${collapsed ? 'justify-center' : ''}
                    ${isActive
                      ? 'bg-[var(--secondary)] text-[var(--primary)] font-medium'
                      : 'text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]'
                    }
                  `}
                  title={collapsed ? label : undefined}
                >
                  <Icon size={17} className="flex-shrink-0" />
                  {!collapsed && <span>{label}</span>}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* User */}
      <div className="p-3 border-t border-[var(--border)]">
        {!collapsed ? (
          <div className="flex items-center gap-3 px-2 py-2 rounded-[var(--radius)] hover:bg-[var(--muted)] cursor-pointer group" onClick={() => navigate('/profile')}>
            <Avatar name={user?.name || 'User'} src={user?.avatar} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[var(--foreground)] truncate">{user?.name || 'Your Account'}</p>
              <p className="text-xs text-[var(--muted-foreground)] truncate">{user?.email || ''}</p>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); handleLogout() }}
              className="opacity-0 group-hover:opacity-100 text-[var(--muted-foreground)] hover:text-[var(--destructive)] transition-all"
              title="Logout"
            >
              <LogOut size={15} />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Avatar name={user?.name || 'U'} src={user?.avatar} size="sm" />
            <button onClick={handleLogout} className="text-[var(--muted-foreground)] hover:text-[var(--destructive)]" title="Logout">
              <LogOut size={15} />
            </button>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col h-screen sticky top-0 border-r border-[var(--border)] bg-[var(--card)] transition-all duration-200 flex-shrink-0 ${
          collapsed ? 'w-16' : 'w-60'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/50" onClick={onMobileClose} />
          <aside className="relative z-10 w-64 h-full bg-[var(--card)] border-r border-[var(--border)] flex flex-col animate-slide-left">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  )
}
