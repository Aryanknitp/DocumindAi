import { useState } from 'react'
import { BookOpen, ChevronLeft, ChevronRight, RotateCcw, Sparkles, Plus, Check, X, ChevronDown } from 'lucide-react'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'
import Card, { CardContent } from '../../components/ui/Card'

export default function Flashcards() {
  const [selectedDoc, setSelectedDoc] = useState('')
  const [cards, setCards] = useState([])
  const [currentIdx, setCurrentIdx] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleGenerate = () => {
    if (!selectedDoc) return
    setLoading(true)
    // API integration point
    setTimeout(() => { setLoading(false); setCards([]) }, 1000)
  }

  const current = cards[currentIdx]

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Flashcards</h1>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">AI-generated study flashcards from your PDFs</p>
        </div>
        <Button variant="gradient" size="sm" onClick={handleGenerate} loading={loading} disabled={!selectedDoc}>
          <Sparkles size={14} /> Generate
        </Button>
      </div>

      {/* Document select */}
      <div className="relative max-w-xs">
        <select value={selectedDoc} onChange={e => setSelectedDoc(e.target.value)} className="w-full h-9 px-3 pr-8 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--card)] text-sm text-[var(--foreground)] focus:outline-none appearance-none">
          <option value="">Choose document...</option>
        </select>
        <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] pointer-events-none" />
      </div>

      {/* Card viewer */}
      {cards.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No flashcards yet"
          description="Select a document and click Generate to create AI flashcards."
          action={handleGenerate}
          actionLabel="Generate Flashcards"
        />
      ) : (
        <div className="space-y-4">
          <div className="text-center text-sm text-[var(--muted-foreground)]">
            {currentIdx + 1} of {cards.length}
          </div>
          <div
            onClick={() => setFlipped(v => !v)}
            className="relative h-60 cursor-pointer"
            style={{ perspective: '1000px' }}
          >
            <div className={`relative w-full h-full transition-transform duration-500 ease-in-out ${flipped ? '[transform:rotateY(180deg)]' : ''}`} style={{ transformStyle: 'preserve-3d' }}>
              <div className="absolute inset-0 bg-[var(--card)] border-2 border-[var(--primary)]/30 rounded-2xl flex flex-col items-center justify-center p-6 [backface-visibility:hidden]">
                <p className="text-xs text-[var(--muted-foreground)] mb-4 uppercase tracking-wide">Question</p>
                <p className="text-lg font-semibold text-center text-[var(--foreground)]">{current?.question}</p>
                <p className="text-xs text-[var(--muted-foreground)] mt-4">Click to reveal answer</p>
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-950/50 dark:to-violet-950/50 border-2 border-[var(--primary)] rounded-2xl flex flex-col items-center justify-center p-6 [backface-visibility:hidden] [transform:rotateY(180deg)]">
                <p className="text-xs text-[var(--primary)] mb-4 uppercase tracking-wide font-medium">Answer</p>
                <p className="text-lg text-center text-[var(--foreground)]">{current?.answer}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Button variant="outline" size="sm" onClick={() => setFlipped(false) || setCurrentIdx(i => Math.max(0, i - 1))} disabled={currentIdx === 0}>
              <ChevronLeft size={15} /> Prev
            </Button>
            <div className="flex gap-3">
              <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-500/10 text-red-500 text-sm hover:bg-red-500/20">
                <X size={14} /> Missed
              </button>
              <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-500/10 text-emerald-500 text-sm hover:bg-emerald-500/20">
                <Check size={14} /> Got it
              </button>
            </div>
            <Button variant="outline" size="sm" onClick={() => setFlipped(false) || setCurrentIdx(i => Math.min(cards.length - 1, i + 1))} disabled={currentIdx === cards.length - 1}>
              Next <ChevronRight size={15} />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
