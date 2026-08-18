import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Menu, Search, Bell, Settings, LogOut, User, ChevronDown, Zap
} from 'lucide-react'
import ThemeToggle from '../ui/ThemeToggle'
import Avatar from '../ui/Avatar'
import { useAuth } from '../../context/AuthContext'

export default function Topbar({ onMenuClick, title }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [searchFocused, setSearchFocused] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-30 h-14 flex items-center gap-3 px-4 border-b border-[var(--border)] bg-[var(--background)]/80 glass">
      <button
        onClick={onMenuClick}
        className="lg:hidden h-9 w-9 flex items-center justify-center rounded-[var(--radius)] border border-[var(--border)] bg-[var(--card)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
      >
        <Menu size={16} />
      </button>

      {title && <h1 className="font-semibold text-[var(--foreground)] hidden sm:block">{title}</h1>}

      {/* Search */}
      <div className={`flex-1 max-w-md mx-auto relative transition-all duration-200 ${searchFocused ? 'max-w-lg' : ''}`}>
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] pointer-events-none" />
        <input
          type="text"
          placeholder="Search documents, chats, summaries..."
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          onClick={() => navigate('/search')}
          className="w-full h-9 pl-9 pr-4 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--card)] text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] transition-all cursor-pointer"
          readOnly
        />
      </div>

      <div className="flex items-center gap-2 ml-auto">
        {/* Upgrade badge */}
        <button
          onClick={() => navigate('/billing')}
          className="hidden md:flex items-center gap-1.5 px-3 h-8 rounded-full bg-gradient-to-r from-indigo-500/10 to-violet-500/10 border border-indigo-500/20 text-xs font-medium text-[var(--primary)] hover:opacity-80 transition-opacity"
        >
          <Zap size={12} />
          Upgrade
        </button>

        <ThemeToggle />

        {/* Notifications */}
        <button
          onClick={() => navigate('/notifications')}
          className="relative h-9 w-9 flex items-center justify-center rounded-[var(--radius)] border border-[var(--border)] bg-[var(--card)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
        >
          <Bell size={16} />
        </button>

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setUserMenuOpen(v => !v)}
            className="flex items-center gap-2 h-9 px-2 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--muted)] transition-colors"
          >
            <Avatar name={user?.name || 'User'} src={user?.avatar} size="xs" />
            <ChevronDown size={13} className="text-[var(--muted-foreground)] hidden sm:block" />
          </button>

          {userMenuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
              <div className="absolute right-0 top-11 z-20 w-52 bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-xl py-1 animate-scale-in">
                <div className="px-3 py-2 border-b border-[var(--border)]">
                  <p className="text-sm font-medium text-[var(--foreground)] truncate">{user?.name || 'Your Account'}</p>
                  <p className="text-xs text-[var(--muted-foreground)] truncate">{user?.email || ''}</p>
                </div>
                {[
                  { icon: User, label: 'Profile', to: '/profile' },
                  { icon: Settings, label: 'Settings', to: '/settings' },
                ].map(({ icon: Icon, label, to }) => (
                  <button
                    key={to}
                    onClick={() => { navigate(to); setUserMenuOpen(false) }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
                  >
                    <Icon size={15} className="text-[var(--muted-foreground)]" />
                    {label}
                  </button>
                ))}
                <div className="border-t border-[var(--border)] mt-1 pt-1">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-[var(--destructive)] hover:bg-[var(--muted)] transition-colors"
                  >
                    <LogOut size={15} />
                    Sign out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
