import { NavLink } from 'react-router-dom'
import { LayoutDashboard, FileText, Upload, MessageSquare, User } from 'lucide-react'

const items = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Home' },
  { to: '/documents', icon: FileText, label: 'Docs' },
  { to: '/upload', icon: Upload, label: 'Upload' },
  { to: '/chat', icon: MessageSquare, label: 'Chat' },
  { to: '/profile', icon: User, label: 'Profile' },
]

export default function BottomNav() {
  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-[var(--card)] border-t border-[var(--border)] flex">
      {items.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) => `
            flex-1 flex flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-medium transition-colors
            ${isActive ? 'text-[var(--primary)]' : 'text-[var(--muted-foreground)]'}
          `}
        >
          {({ isActive }) => (
            <>
              <span className={`p-1.5 rounded-lg transition-all ${isActive ? 'bg-[var(--secondary)]' : ''}`}>
                <Icon size={18} />
              </span>
              {label}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
