import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  MessageSquare, Send, Plus, Search, Trash2, ThumbsUp, ThumbsDown,
  Copy, RefreshCw, Square, Paperclip, Mic, FileText, Brain,
  MoreHorizontal, ChevronLeft
} from 'lucide-react'
import Button from '../../components/ui/Button'
import Avatar from '../../components/ui/Avatar'
import EmptyState from '../../components/ui/EmptyState'
import { useAuth } from '../../context/AuthContext'

function MessageBubble({ message, onCopy, onLike, onDislike, onRegenerate }) {
  const isUser = message.role === 'user'
  const { user } = useAuth()

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''} group animate-fade-in`}>
      {isUser
        ? <Avatar name={user?.name || 'User'} src={user?.avatar} size="sm" className="flex-shrink-0 mt-1" />
        : (
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center flex-shrink-0 mt-1">
            <Brain size={16} className="text-white" />
          </div>
        )
      }

      <div className={`flex-1 max-w-[80%] ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
        <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isUser
            ? 'bg-gradient-to-br from-indigo-500 to-violet-500 text-white rounded-tr-sm'
            : 'bg-[var(--card)] border border-[var(--border)] text-[var(--foreground)] rounded-tl-sm'
        }`}>
          {message.streaming ? (
            <span className="flex items-center gap-2">
              {message.content}
              <span className="inline-flex gap-0.5">
                {[0, 1, 2].map(i => (
                  <span key={i} className="h-1.5 w-1.5 rounded-full bg-current animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </span>
            </span>
          ) : message.content}
        </div>

        {!isUser && !message.streaming && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {[
              { icon: Copy, action: () => onCopy(message.content), title: 'Copy' },
              { icon: ThumbsUp, action: () => onLike(message.id), title: 'Good response' },
              { icon: ThumbsDown, action: () => onDislike(message.id), title: 'Poor response' },
              { icon: RefreshCw, action: () => onRegenerate(message.id), title: 'Regenerate' },
            ].map(({ icon: Icon, action, title }) => (
              <button
                key={title}
                onClick={action}
                title={title}
                className="h-6 w-6 flex items-center justify-center rounded-md text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
              >
                <Icon size={12} />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function Chat() {
  const navigate = useNavigate()
  const [input, setInput] = useState('')
  const [conversations, setConversations] = useState([])
  const [activeConv, setActiveConv] = useState(null)
  const [messages, setMessages] = useState([])
  const [generating, setGenerating] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = () => {
    if (!input.trim() || generating) return
    const userMsg = { id: Date.now(), role: 'user', content: input.trim() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setGenerating(true)
    // API integration point: stream response from backend
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'assistant',
        content: '',
        streaming: true,
      }])
      // Simulate streaming end
      setTimeout(() => {
        setMessages(prev => prev.map(m => m.streaming ? { ...m, streaming: false, content: 'Connect your backend API to generate AI responses. This message will be replaced by actual AI responses from your PDF document.' } : m))
        setGenerating(false)
      }, 1500)
    }, 500)
  }

  const handleCopy = (text) => navigator.clipboard.writeText(text)

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex h-[calc(100vh-3.5rem)] overflow-hidden">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-0'} flex-shrink-0 border-r border-[var(--border)] bg-[var(--card)] flex flex-col overflow-hidden transition-all duration-200`}>
        <div className="p-3 border-b border-[var(--border)]">
          <Button variant="gradient" size="sm" onClick={() => { setMessages([]); setActiveConv(null) }} className="w-full">
            <Plus size={14} /> New Chat
          </Button>
        </div>
        <div className="px-3 py-2">
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
            <input
              placeholder="Search conversations..."
              className="w-full h-8 pl-7 pr-3 rounded-lg border border-[var(--border)] bg-[var(--background)] text-xs text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-2 py-1">
          {conversations.length === 0 ? (
            <div className="text-center py-8 text-xs text-[var(--muted-foreground)]">
              No conversations yet.<br />Start chatting with a PDF.
            </div>
          ) : conversations.map(conv => (
            <button key={conv.id} onClick={() => setActiveConv(conv.id)} className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors mb-0.5 ${activeConv === conv.id ? 'bg-[var(--secondary)] text-[var(--primary)]' : 'text-[var(--foreground)] hover:bg-[var(--muted)]'}`}>
              <p className="font-medium truncate">{conv.title}</p>
              <p className="text-[var(--muted-foreground)] truncate">{conv.preview}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Chat header */}
        <div className="flex items-center gap-3 px-4 h-12 border-b border-[var(--border)] bg-[var(--card)] flex-shrink-0">
          <button onClick={() => setSidebarOpen(v => !v)} className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
            <ChevronLeft size={18} className={`transition-transform ${sidebarOpen ? '' : 'rotate-180'}`} />
          </button>
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center">
              <Brain size={13} className="text-white" />
            </div>
            <span className="text-sm font-medium text-[var(--foreground)]">
              {activeConv ? 'Active Conversation' : 'New Conversation'}
            </span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-[var(--muted)] text-[var(--muted-foreground)]">
              <Trash2 size={14} />
            </button>
            <button className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-[var(--muted)] text-[var(--muted-foreground)]">
              <MoreHorizontal size={14} />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <EmptyState
              icon={MessageSquare}
              title="Start a conversation"
              description="Select a PDF from your library or upload one, then ask questions to get instant AI-powered answers."
              action={() => navigate('/upload')}
              actionLabel="Upload a PDF"
            />
          ) : (
            messages.map(msg => (
              <MessageBubble
                key={msg.id}
                message={msg}
                onCopy={handleCopy}
                onLike={() => {}}
                onDislike={() => {}}
                onRegenerate={() => {}}
              />
            ))
          )}
          {generating && messages[messages.length - 1]?.role !== 'assistant' && (
            <div className="flex gap-3 animate-fade-in">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center">
                <Brain size={16} className="text-white" />
              </div>
              <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl rounded-tl-sm px-4 py-3">
                <span className="inline-flex gap-1">
                  {[0, 1, 2].map(i => (
                    <span key={i} className="h-1.5 w-1.5 rounded-full bg-[var(--muted-foreground)] animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-[var(--border)] bg-[var(--card)] flex-shrink-0">
          <div className="flex items-end gap-2 bg-[var(--background)] border border-[var(--border)] rounded-xl p-2 focus-within:ring-2 focus-within:ring-[var(--ring)] transition-all">
            <button className="h-8 w-8 flex items-center justify-center rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] flex-shrink-0">
              <Paperclip size={16} />
            </button>
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything about your PDF..."
              rows={1}
              className="flex-1 bg-transparent text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] resize-none focus:outline-none max-h-32 py-1"
              style={{ lineHeight: '1.5' }}
            />
            <div className="flex items-center gap-1 flex-shrink-0">
              <button className="h-8 w-8 flex items-center justify-center rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]">
                <Mic size={16} />
              </button>
              {generating ? (
                <button
                  className="h-8 w-8 flex items-center justify-center rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20"
                  title="Stop generation"
                >
                  <Square size={14} />
                </button>
              ) : (
                <button
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className="h-8 w-8 flex items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 text-white disabled:opacity-40 hover:opacity-90 transition-opacity"
                >
                  <Send size={14} />
                </button>
              )}
            </div>
          </div>
          <p className="text-[10px] text-[var(--muted-foreground)] text-center mt-2">
            AI responses are based on your document content. Always verify important information.
          </p>
        </div>
      </div>
    </div>
  )
}
