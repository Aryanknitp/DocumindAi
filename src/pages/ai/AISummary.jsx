import { useState } from 'react'
import {
  Sparkles, Copy, Download, Share2, RefreshCw, Printer,
  Globe, FileText, ChevronDown, Loader2, AlertCircle, Brain
} from 'lucide-react'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'

const modes = [
  { id: 'short', label: 'Short', desc: '~100 words' },
  { id: 'medium', label: 'Medium', desc: '~300 words' },
  { id: 'detailed', label: 'Detailed', desc: '~600 words' },
  { id: 'bullets', label: 'Bullet Points', desc: 'Key points' },
  { id: 'executive', label: 'Executive', desc: 'C-suite format' },
  { id: 'academic', label: 'Academic', desc: 'Scholarly tone' },
  { id: 'research', label: 'Research', desc: 'Citation-ready' },
  { id: 'technical', label: 'Technical', desc: 'Technical depth' },
  { id: 'business', label: 'Business', desc: 'Action-oriented' },
  { id: 'legal', label: 'Legal', desc: 'Legal language' },
  { id: 'medical', label: 'Medical', desc: 'Clinical format' },
]

const states = { idle: 'idle', loading: 'loading', streaming: 'streaming', success: 'success', error: 'error' }

export default function AISummary() {
  const [mode, setMode] = useState('medium')
  const [status, setStatus] = useState(states.idle)
  const [summary, setSummary] = useState('')
  const [selectedDoc, setSelectedDoc] = useState(null)
  const [copied, setCopied] = useState(false)

  const handleGenerate = async () => {
    if (!selectedDoc) return
    setStatus(states.loading)
    setSummary('')
    // API integration point: await api.generateSummary(selectedDoc, mode)
    // Simulate streaming
    setTimeout(() => {
      setStatus(states.streaming)
      const chunks = ['Connecting to AI backend will enable ', 'real summaries. ', 'Select a document from your library ', 'and choose a summary mode. ', 'Your AI-generated summary ', 'will stream here in real time.']
      let i = 0
      const interval = setInterval(() => {
        if (i < chunks.length) {
          setSummary(prev => prev + chunks[i])
          i++
        } else {
          clearInterval(interval)
          setStatus(states.success)
        }
      }, 200)
    }, 1000)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(summary)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">AI Summary</h1>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">Generate intelligent summaries from your documents</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Controls */}
        <div className="space-y-4">
          {/* Document selector */}
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4">
            <h3 className="text-sm font-semibold text-[var(--foreground)] mb-3 flex items-center gap-2">
              <FileText size={15} /> Select Document
            </h3>
            <div className="relative">
              <select
                value={selectedDoc || ''}
                onChange={e => setSelectedDoc(e.target.value || null)}
                className="w-full h-9 px-3 pr-8 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--background)] text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] appearance-none"
              >
                <option value="">Choose a document...</option>
                {/* Options populated from backend */}
              </select>
              <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] pointer-events-none" />
            </div>
            {!selectedDoc && (
              <p className="text-xs text-[var(--muted-foreground)] mt-2">Upload documents first to enable summaries.</p>
            )}
          </div>

          {/* Mode selector */}
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4">
            <h3 className="text-sm font-semibold text-[var(--foreground)] mb-3 flex items-center gap-2">
              <Sparkles size={15} /> Summary Mode
            </h3>
            <div className="space-y-1">
              {modes.map(m => (
                <button
                  key={m.id}
                  onClick={() => setMode(m.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all ${
                    mode === m.id
                      ? 'bg-[var(--secondary)] text-[var(--primary)] font-medium'
                      : 'text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]'
                  }`}
                >
                  <span>{m.label}</span>
                  <span className="text-xs opacity-60">{m.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <Button
            variant="gradient"
            size="lg"
            onClick={handleGenerate}
            disabled={!selectedDoc}
            loading={status === states.loading}
            className="w-full"
          >
            <Sparkles size={16} />
            {status === states.loading ? 'Generating…' : 'Generate Summary'}
          </Button>
        </div>

        {/* Output */}
        <div className="lg:col-span-2">
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl min-h-96 flex flex-col">
            {/* Actions */}
            {(status === states.success || status === states.streaming) && (
              <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--border)]">
                <span className="text-xs font-medium text-[var(--muted-foreground)] mr-auto">
                  {modes.find(m => m.id === mode)?.label} Summary
                  {status === states.streaming && (
                    <span className="ml-2 inline-flex items-center gap-1 text-[var(--primary)]">
                      <Loader2 size={11} className="animate-spin" /> Streaming…
                    </span>
                  )}
                </span>
                {[
                  { icon: Copy, label: copied ? 'Copied!' : 'Copy', action: handleCopy },
                  { icon: Download, label: 'Export', action: () => {} },
                  { icon: Printer, label: 'Print', action: () => window.print() },
                  { icon: Share2, label: 'Share', action: () => {} },
                  { icon: Globe, label: 'Translate', action: () => {} },
                  { icon: RefreshCw, label: 'Regenerate', action: handleGenerate },
                ].map(({ icon: Icon, label, action }) => (
                  <button
                    key={label}
                    onClick={action}
                    title={label}
                    className="h-7 w-7 flex items-center justify-center rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
                  >
                    <Icon size={14} />
                  </button>
                ))}
              </div>
            )}

            {/* Content */}
            <div className="flex-1 p-5">
              {status === states.idle && (
                <EmptyState
                  icon={Sparkles}
                  title="No summary yet"
                  description="Select a document and summary mode, then click Generate to get an AI-powered summary."
                />
              )}
              {status === states.loading && (
                <div className="flex flex-col items-center justify-center h-full gap-4">
                  <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center animate-pulse-glow">
                    <Brain size={28} className="text-white animate-spin-slow" />
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-[var(--foreground)]">Analyzing document…</p>
                    <p className="text-sm text-[var(--muted-foreground)] mt-1">This may take a few seconds</p>
                  </div>
                </div>
              )}
              {(status === states.streaming || status === states.success) && (
                <div className="prose prose-sm max-w-none text-[var(--foreground)] leading-relaxed animate-fade-in">
                  <p>{summary}{status === states.streaming && <span className="inline-block h-4 w-0.5 bg-[var(--primary)] animate-pulse ml-0.5 align-middle" />}</p>
                </div>
              )}
              {status === states.error && (
                <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
                  <AlertCircle size={32} className="text-[var(--destructive)]" />
                  <p className="font-medium text-[var(--foreground)]">Failed to generate summary</p>
                  <p className="text-sm text-[var(--muted-foreground)]">Check your connection and try again.</p>
                  <Button variant="outline" size="sm" onClick={handleGenerate}>
                    <RefreshCw size={13} /> Retry
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
