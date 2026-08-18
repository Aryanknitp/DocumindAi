import { Link } from 'react-router-dom'
import { Brain } from 'lucide-react'
import ThemeToggle from '../components/ui/ThemeToggle'

export default function AuthLayout({ children, title, subtitle, altText, altLink, altLinkText }) {
  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center">
            <Brain size={18} className="text-white" />
          </div>
          <span className="font-semibold text-[var(--foreground)]">DocuMind <span className="text-[var(--primary)]">AI</span></span>
        </Link>
        <ThemeToggle />
      </header>

      {/* Body */}
      <div className="flex-1 flex">
        {/* Form side */}
        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-md animate-fade-in">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-[var(--foreground)]">{title}</h1>
              {subtitle && <p className="mt-2 text-[var(--muted-foreground)] text-sm">{subtitle}</p>}
            </div>
            {children}
            {altText && (
              <p className="mt-6 text-center text-sm text-[var(--muted-foreground)]">
                {altText}{' '}
                <Link to={altLink} className="text-[var(--primary)] font-medium hover:underline">
                  {altLinkText}
                </Link>
              </p>
            )}
          </div>
        </div>

        {/* Visual side */}
        <div className="hidden lg:flex flex-1 bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: 'radial-gradient(circle at center, rgba(255,255,255,0.3) 1px, transparent 1px)',
              backgroundSize: '28px 28px'
            }}
          />
          <div className="relative z-10 text-center px-12 text-white">
            <div className="h-20 w-20 rounded-3xl bg-white/10 border border-white/20 flex items-center justify-center mx-auto mb-6 animate-float">
              <Brain size={40} className="text-white" />
            </div>
            <h2 className="text-3xl font-bold mb-4 leading-tight">
              Your AI-Powered<br />PDF Intelligence
            </h2>
            <p className="text-white/70 text-sm leading-relaxed max-w-xs mx-auto">
              Summarize, chat, and extract insights from any PDF document using advanced AI technology.
            </p>
            <div className="mt-8 grid grid-cols-2 gap-3 text-left">
              {['AI Summaries', 'Chat with PDF', 'Flashcards', 'Mind Maps'].map(f => (
                <div key={f} className="bg-white/10 border border-white/15 rounded-xl px-4 py-3 text-sm font-medium backdrop-blur-sm">
                  {f}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
