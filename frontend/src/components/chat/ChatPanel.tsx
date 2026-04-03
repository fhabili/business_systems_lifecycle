import { useState, useEffect, useRef } from 'react'
import { fetchChat, type ChatMessage } from '../../api'

const STARTERS = [
  'What is the LCR regulatory minimum?',
  'How does the 2020 COVID relief appear in this data?',
  'What is the source of the regulatory data in this system?',
  'How is data quality measured in this system?',
]

interface SidebarProps {
  open: boolean
  onToggle: () => void
}

export function Sidebar({ open, onToggle }: SidebarProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput]       = useState('')
  const [sending, setSending]   = useState(false)
  const scrollRef               = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [messages, sending])

  async function send(text: string) {
    const trimmed = text.trim()
    if (!trimmed || sending) return
    const userMsg: ChatMessage = { role: 'user', content: trimmed }
    const newHistory = [...messages, userMsg]
    setMessages(newHistory)
    setInput('')
    setSending(true)
    try {
      const { reply } = await fetchChat(trimmed, messages)
      setMessages([...newHistory, { role: 'assistant', content: reply }])
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      setMessages([...newHistory, { role: 'assistant', content: `Error: ${msg}` }])
    } finally {
      setSending(false)
    }
  }

  return (
    <aside
      className="hidden md:flex flex-col shrink-0 min-h-0 border-r border-gray-200 bg-white transition-[width] duration-300 ease-in-out overflow-hidden"
      style={{ width: open ? 320 : 48 }}
    >
      {open ? (
        /* ── Expanded panel ── */
        <div className="flex flex-col h-full w-[320px]">
          {/* Header */}
          <div className="flex items-center justify-between px-4 h-12 border-b border-gray-100 shrink-0">
            <p className="text-sm font-semibold" style={{ color: '#1B2A4A' }}>AI Assistant</p>
            <div className="flex items-center gap-1">
              {messages.length > 0 && (
                <button
                  onClick={() => setMessages([])}
                  className="text-[11px] text-gray-400 hover:text-red-500 px-1.5 py-0.5 rounded hover:bg-red-50 transition-colors"
                  title="Clear conversation"
                >
                  Clear
                </button>
              )}
              <button
                onClick={onToggle}
                className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100 transition-colors"
                title="Collapse sidebar"
                aria-label="Collapse AI assistant"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
            </div>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {messages.length === 0 && !sending ? (
              <div>
                <p className="text-xs text-gray-400 mb-3 leading-relaxed">
                  Ask about the Basel III framework, LCR/NSFR ratios, or the data pipeline.
                </p>
                <div className="flex flex-col gap-1.5">
                  {STARTERS.map(q => (
                    <button
                      key={q}
                      onClick={() => send(q)}
                      className="text-left text-xs text-gray-600 hover:text-gray-900 border border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50 rounded-lg px-3 py-2 transition-colors leading-relaxed"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className="rounded-lg px-3 py-2 text-xs max-w-[85%] leading-relaxed whitespace-pre-wrap"
                    style={m.role === 'user'
                      ? { backgroundColor: '#1B2A4A', color: '#ffffff' }
                      : { backgroundColor: '#F3F4F6', color: '#111827' }
                    }
                  >
                    {m.content}
                  </div>
                </div>
              ))
            )}
            {sending && (
              <div className="flex justify-start">
                <div className="rounded-lg px-3 py-2 text-xs text-gray-400 animate-pulse" style={{ backgroundColor: '#F3F4F6' }}>
                  Analysing…
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="px-3 py-3 border-t border-gray-100 shrink-0">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input) } }}
                placeholder="Ask a question…"
                disabled={sending}
                className="flex-1 text-xs border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 disabled:bg-gray-50"
                style={{ '--tw-ring-color': '#1B2A4A' } as React.CSSProperties}
              />
              <button
                onClick={() => send(input)}
                disabled={!input.trim() || sending}
                className="text-white text-xs px-3 py-2 rounded-lg disabled:opacity-40 transition-colors"
                style={{ backgroundColor: '#1B2A4A' }}
                onMouseEnter={e => { if (!e.currentTarget.disabled) e.currentTarget.style.backgroundColor = '#2563EB' }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#1B2A4A' }}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* ── Collapsed rail ── */
        <div className="flex flex-col items-center w-12 py-3">
          <button
            onClick={onToggle}
            className="flex items-center justify-center w-8 h-8 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            title="Expand AI Assistant"
            aria-label="Expand AI assistant"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
            </svg>
          </button>
        </div>
      )}
    </aside>
  )
}
