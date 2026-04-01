import { useState, useEffect, useRef } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { fetchSummary, fetchChat, type SummaryResponse, type ChatMessage } from '../api'

// ── helpers ─────────────────────────────────────────────────────────────────

function statusFor(value: number | null, min = 100): 'pass' | 'warn' | 'fail' {
  if (value === null) return 'warn'
  if (value >= min + 10) return 'pass'
  if (value >= min) return 'warn'
  return 'fail'
}

// ── shared sub-components ───────────────────────────────────────────────────

function MetricCard({ label, value, unit, status }: { label: string; value: string; unit: string; status: 'pass' | 'warn' | 'fail' }) {
  const colors = { pass: 'bg-emerald-50 border-emerald-200 text-emerald-700', warn: 'bg-amber-50 border-amber-200 text-amber-700', fail: 'bg-red-50 border-red-200 text-red-700' }
  return (
    <div className={`rounded-xl border p-6 ${colors[status]}`}>
      <p className="text-sm font-medium opacity-70">{label}</p>
      <p className="mt-1 text-4xl font-bold">{value}<span className="text-lg font-normal ml-1">{unit}</span></p>
      <p className="mt-2 text-xs uppercase tracking-wide font-semibold">{status === 'pass' ? '✓ Compliant' : status === 'warn' ? '⚠ Watch' : '✗ Breach'}</p>
    </div>
  )
}

function LcrTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null
  const v = payload[0].value
  const interpretation = v >= 150 ? 'Well above minimum — strong liquidity buffer.'
    : v >= 120 ? 'Comfortably compliant with Basel III minimum.'
    : v >= 100 ? 'Compliant but approaching the 100% regulatory floor.'
    : 'BREACH — below the 100% minimum requirement.'
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-xs max-w-[200px]">
      <p className="font-semibold text-gray-700 mb-1">{label}</p>
      <p className="text-lg font-bold text-emerald-700">{v.toFixed(1)}%</p>
      <p className="text-gray-500 mt-1 leading-snug">{interpretation}</p>
    </div>
  )
}

// ── AI chat panel ────────────────────────────────────────────────────────────

const STARTERS = [
  'What does LCR mean?',
  'Why did LCR spike in 2020?',
  'What is the regulatory minimum?',
  'How is this data validated?',
]

function ChatPanel({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

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
    <div className="rounded-xl border border-indigo-200 bg-white flex flex-col h-full shadow-sm">
      {/* header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 shrink-0">
        <div>
          <p className="font-semibold text-sm text-gray-800">AI Assistant</p>
          <p className="text-xs text-gray-400">Groq · llama-3.3-70b</p>
        </div>
        <div className="flex items-center gap-1">
          {messages.length > 0 && (
            <button
              onClick={() => setMessages([])}
              className="text-xs text-gray-400 hover:text-red-500 px-2 py-1 rounded hover:bg-red-50 transition-colors"
              title="Clear conversation"
            >
              Clear
            </button>
          )}
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-lg leading-none px-1 ml-1"
            title="Collapse panel"
          >
            ←
          </button>
        </div>
      </div>

      {/* messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && !sending ? (
          <div>
            <p className="text-xs text-gray-400 mb-3 leading-relaxed">
              Ask me anything about this dashboard, the Basel III framework, or the underlying data pipeline.
            </p>
            <div className="flex flex-col gap-2">
              {STARTERS.map(q => (
                <button
                  key={q}
                  onClick={() => send(q)}
                  className="text-left text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-100 rounded-lg px-3 py-2 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`rounded-2xl px-3 py-2 text-xs max-w-[80%] leading-relaxed whitespace-pre-wrap ${
                m.role === 'user'
                  ? 'bg-indigo-600 text-white rounded-br-sm'
                  : 'bg-sky-50 text-gray-800 border border-sky-100 rounded-bl-sm'
              }`}>
                {m.content}
              </div>
            </div>
          ))
        )}
        {sending && (
          <div className="flex justify-start">
            <div className="rounded-2xl rounded-bl-sm px-3 py-2 text-xs bg-sky-50 border border-sky-100 text-sky-400 animate-pulse">
              Analysing…
            </div>
          </div>
        )}
      </div>

      {/* input */}
      <div className="p-3 border-t border-gray-100 shrink-0">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input) } }}
            placeholder="Ask a question…"
            disabled={sending}
            className="flex-1 text-xs border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300 disabled:bg-gray-50"
          />
          <button
            onClick={() => send(input)}
            disabled={!input.trim() || sending}
            className="bg-indigo-600 text-white text-xs px-3 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-40 transition-colors"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  )
}

// ── pro-forma simulator ────────────────────────────────────────────────────

const BASE_HQLA      = 5_112_700  // EUR Millions
const BASE_OUTFLOWS  = 3_223_600  // EUR Millions
const BASE_LCR       = parseFloat((BASE_HQLA / BASE_OUTFLOWS * 100).toFixed(1))

type AccountType = 'Cash & Central Bank Reserves' | 'Level 1 Govt Bonds' | 'Retail Deposits' | 'Wholesale Funding'

const ACCOUNT_TYPES: AccountType[] = [
  'Cash & Central Bank Reserves',
  'Level 1 Govt Bonds',
  'Retail Deposits',
  'Wholesale Funding',
]

function ProFormaSimulator() {
  const [accountType, setAccountType] = useState<AccountType>('Cash & Central Bank Reserves')
  const [amount, setAmount]           = useState('')
  const [result, setResult]           = useState<{ proFormaLcr: number; delta: number; newHqla: number; newOutflows: number } | null>(null)
  const [showTip, setShowTip]         = useState(false)
  const [calculating, setCalculating] = useState(false)

  function calculate() {
    const eur = parseFloat(amount)
    if (isNaN(eur) || eur <= 0) return
    setCalculating(true)
    setResult(null)
    setTimeout(() => {
      let newHqla     = BASE_HQLA
      let newOutflows = BASE_OUTFLOWS
      if (accountType === 'Cash & Central Bank Reserves' || accountType === 'Level 1 Govt Bonds') {
        newHqla = BASE_HQLA + eur
      } else if (accountType === 'Retail Deposits') {
        newOutflows = BASE_OUTFLOWS + eur * 0.05
      } else if (accountType === 'Wholesale Funding') {
        newOutflows = BASE_OUTFLOWS + eur * 1.00
      }
      const proFormaLcr = parseFloat((newHqla / newOutflows * 100).toFixed(2))
      const delta       = parseFloat((proFormaLcr - BASE_LCR).toFixed(2))
      setResult({ proFormaLcr, delta, newHqla, newOutflows })
      setCalculating(false)
    }, 1000)
  }

  const isHqlaType = accountType === 'Cash & Central Bank Reserves' || accountType === 'Level 1 Govt Bonds'
  const weight     = accountType === 'Retail Deposits' ? '5%' : accountType === 'Wholesale Funding' ? '100%' : '—'

  return (
    <div className="rounded-xl border border-gray-200 bg-[#F9FAFB] p-6 space-y-5">
      <div>
        <h2 className="text-base font-semibold text-gray-900">⚡ Strategic Pro-Forma Simulator</h2>
        <p className="text-xs text-gray-400 mt-0.5">
          Model the LCR impact of a transaction before execution — frontend-only, no data is sent.
        </p>
      </div>

      {/* form — stacks vertically on mobile */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        {/* account type */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Account Type</label>
          <select
            value={accountType}
            onChange={e => { setAccountType(e.target.value as AccountType); setResult(null) }}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-300"
          >
            {ACCOUNT_TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
          <p className="text-xs text-gray-400">
            {isHqlaType
              ? 'Run-off weight: 0% (Level 1 HQLA — no haircut)'
              : `CRR run-off weight: ${weight}`}
          </p>
        </div>

        {/* amount */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Amount (EUR Millions)</label>
          <input
            type="number"
            min={0}
            placeholder="e.g. 50000"
            value={amount}
            onChange={e => { setAmount(e.target.value); setResult(null) }}
            onKeyDown={e => { if (e.key === 'Enter') calculate() }}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-300"
          />
        </div>

        {/* button with tooltip */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide opacity-0 select-none">Action</label>
          <div className="relative inline-block">
            <button
              onClick={calculate}
              disabled={!amount || parseFloat(amount) <= 0 || calculating}
              className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-40 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
              onMouseEnter={() => setShowTip(true)}
              onMouseLeave={() => setShowTip(false)}
            >
              {calculating ? (
                <>
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Calculating…
                </>
              ) : '⚡ Calculate Impact'}
            </button>
            {showTip && (
              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-72 bg-gray-900 text-white text-xs rounded-lg px-3 py-2 leading-relaxed shadow-xl z-50 pointer-events-none">
                Applies CRR Article 416/422 run-off weights to simulate pre-trade liquidity impact.
                <span className="absolute top-full left-1/2 -translate-x-1/2 w-3 h-3 bg-gray-900 rotate-45 -mt-1.5" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* regulatory alert banner */}
      {result && result.proFormaLcr < 100 && (
        <div className="flex gap-3 rounded-xl border border-red-300 bg-red-50 px-5 py-4">
          <span className="shrink-0 text-red-500 text-xl leading-none mt-0.5">⚠</span>
          <div>
            <p className="text-sm font-bold text-red-800 mb-0.5">Regulatory Alert</p>
            <p className="text-sm text-red-700 leading-relaxed">
              Warning: Transaction would result in a Liquidity Coverage Ratio breach.
              Under CRR Article 412, institutions must maintain an LCR ≥ 100% at all times.
              This transaction cannot proceed without a compensating liquidity action.
            </p>
          </div>
        </div>
      )}

      {/* result */}
      {result && (
        <div className={`rounded-xl border p-4 ${
          result.proFormaLcr >= 100 ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'
        }`}>
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-500">Current LCR:</span>
              <span className="font-bold text-gray-800">{BASE_LCR.toFixed(1)}%</span>
            </div>
            <span className="text-gray-300">→</span>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-500">Pro-Forma LCR:</span>
              <span className={`text-xl font-bold ${
                result.proFormaLcr >= 100 ? 'text-emerald-700' : 'text-red-600'
              }`}>
                {result.proFormaLcr.toFixed(2)}%
              </span>
            </div>
            <span className={`inline-flex items-center text-xs font-bold px-2.5 py-0.5 rounded-full ${
              result.delta >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
            }`}>
              {result.delta >= 0 ? '+' : ''}{result.delta.toFixed(2)}pp
            </span>
            {result.proFormaLcr < 100 && (
              <span className="text-xs font-bold text-red-600">⚠ Breach — below 100% floor</span>
            )}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="bg-white bg-opacity-70 rounded-lg p-2.5">
              <p className="text-gray-500 mb-0.5">Base HQLA</p>
              <p className="font-mono font-semibold text-gray-700">{BASE_HQLA.toLocaleString()} M</p>
            </div>
            <div className="bg-white bg-opacity-70 rounded-lg p-2.5">
              <p className="text-gray-500 mb-0.5">Pro-Forma HQLA</p>
              <p className="font-mono font-semibold text-gray-700">{result.newHqla.toLocaleString()} M</p>
            </div>
            <div className="bg-white bg-opacity-70 rounded-lg p-2.5">
              <p className="text-gray-500 mb-0.5">Base Outflows</p>
              <p className="font-mono font-semibold text-gray-700">{BASE_OUTFLOWS.toLocaleString()} M</p>
            </div>
            <div className="bg-white bg-opacity-70 rounded-lg p-2.5">
              <p className="text-gray-500 mb-0.5">Pro-Forma Outflows</p>
              <p className="font-mono font-semibold text-gray-700">{result.newOutflows.toLocaleString()} M</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── page ────────────────────────────────────────────────────────────────────

export default function ExecutiveSummary() {
  const [data, setData] = useState<SummaryResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [shock, setShock] = useState(0)
  const [chatOpen, setChatOpen] = useState(true)

  useEffect(() => {
    fetchSummary().then(setData).catch((e: Error) => setError(e.message))
  }, [])

  const lcr  = data?.lcr_ratio  ?? null
  const nsfr = data?.nsfr_ratio ?? null
  const stressedLcr  = lcr  != null ? lcr  * (1 - shock / 100) : null
  const stressedNsfr = nsfr != null ? nsfr * (1 - shock / 100) : null
  const lcrLabel  = stressedLcr  != null ? `${stressedLcr.toFixed(1)}%`  : '—'
  const nsfrLabel = stressedNsfr != null ? `${stressedNsfr.toFixed(1)}%` : '—'
  const asOf = data?.as_of_date ?? '…'

  const lcrBreached  = stressedLcr  != null && stressedLcr  < 100
  const nsfrBreached = stressedNsfr != null && stressedNsfr < 100
  const anyBreach    = lcrBreached || nsfrBreached

  return (
    <div className="flex flex-col md:flex-row gap-6 items-start">

      {/* ── Left: collapsible AI chat panel ─────────────────────────── */}
      {chatOpen ? (
        <div className="w-full md:w-[30%] md:min-w-[260px] md:shrink-0 md:sticky md:top-4 md:self-start" style={{ height: undefined }}>
          <div className="hidden md:flex flex-col" style={{ height: 'calc(100vh - 120px)' }}>
            <ChatPanel onClose={() => setChatOpen(false)} />
          </div>
          {/* mobile: compact collapsible block */}
          <div className="md:hidden rounded-xl border border-indigo-200 bg-white shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <div>
                <p className="font-semibold text-sm text-gray-800">AI Assistant</p>
                <p className="text-xs text-gray-400">Powered by Claude</p>
              </div>
              <button
                onClick={() => setChatOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-lg leading-none px-1"
                title="Collapse panel"
              >
                ✕
              </button>
            </div>
            <div className="h-52 overflow-y-auto p-3 text-xs text-gray-500">
              Use the desktop view for the full AI chat experience.
            </div>
          </div>
        </div>
      ) : (
        <div className="md:shrink-0 md:sticky md:top-4 md:self-start">
          <button
            onClick={() => setChatOpen(true)}
            className="flex items-center gap-2 md:flex-col md:gap-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-3 py-2 md:px-2 md:py-4 shadow transition-colors"
            title="Open AI Assistant"
          >
            <span className="text-base">💬</span>
            <span className="text-[10px] font-semibold tracking-widest md:hidden">AI Chat</span>
            <span className="hidden md:inline text-[10px] font-semibold tracking-widest" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>AI</span>
          </button>
        </div>
      )}

      {/* ── Right: main dashboard content ───────────────────────────── */}
      <div className="flex-1 min-w-0 space-y-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Executive Summary</h1>
            <p className="text-sm text-gray-500 mt-1">Regulatory snapshot — as of {asOf}</p>
          </div>
          <button
            onClick={() => window.print()}
            className="shrink-0 flex items-center gap-2 border border-gray-300 hover:border-indigo-400 hover:text-indigo-700 text-gray-600 text-xs font-semibold px-3 py-2 rounded-lg transition-colors bg-white shadow-sm"
            title="Opens browser print dialog — select 'Save as PDF' to download"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v12m0 0l-4-4m4 4l4-4M4 20h16" />
            </svg>
            Download PDF
          </button>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            <span className="font-semibold">⚠ Could not load data:</span> {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <MetricCard label="Liquidity Coverage Ratio (LCR)"  value={lcrLabel}   unit="min 100%" status={statusFor(stressedLcr)} />
          <MetricCard label="Net Stable Funding Ratio (NSFR)" value={nsfrLabel}  unit="min 100%" status={statusFor(stressedNsfr)} />
          <MetricCard label="Data Quality Score"              value="98.5%"      unit="records passing" status="pass" />
        </div>

        {/* Stress test slider */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-base font-semibold text-gray-800">Stress Test Simulator</h2>
              <p className="text-xs text-gray-400 mt-0.5">Apply a hypothetical funding shock and see the impact on both LCR and NSFR</p>
            </div>
            <span className={`text-sm font-bold px-3 py-1 rounded-full ${
              anyBreach ? 'bg-red-100 text-red-700'
              : shock > 0 ? 'bg-emerald-100 text-emerald-700'
              : 'bg-gray-100 text-gray-400'
            }`}>
              {shock === 0 ? '—' : anyBreach ? '✗ Breach' : '✓ Compliant'}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-xs text-gray-500 w-20 shrink-0">Shock: {shock}%</span>
            <input
              type="range" min={0} max={60} step={1} value={shock}
              onChange={e => setShock(Number(e.target.value))}
              className="flex-1 accent-indigo-600"
            />
            <span className="text-xs text-gray-500 w-24 shrink-0 text-right">
              {shock > 0 ? `−${shock}% applied` : 'No shock'}
            </span>
          </div>

          {shock > 0 && stressedLcr != null && stressedNsfr != null && (
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className={`rounded-lg p-3 text-xs ${lcrBreached ? 'bg-red-50 border border-red-200' : 'bg-emerald-50 border border-emerald-200'}`}>
                <p className="font-semibold text-gray-600 mb-1">LCR after shock</p>
                <p className={`text-xl font-bold ${lcrBreached ? 'text-red-600' : 'text-emerald-700'}`}>{stressedLcr.toFixed(1)}%</p>
                <p className={`mt-1 ${lcrBreached ? 'text-red-500' : 'text-emerald-600'}`}>
                  {lcrBreached
                    ? `Breach by ${(100 - stressedLcr).toFixed(1)}pp`
                    : `${(stressedLcr - 100).toFixed(1)}pp headroom`}
                </p>
              </div>
              <div className={`rounded-lg p-3 text-xs ${nsfrBreached ? 'bg-red-50 border border-red-200' : 'bg-emerald-50 border border-emerald-200'}`}>
                <p className="font-semibold text-gray-600 mb-1">NSFR after shock</p>
                <p className={`text-xl font-bold ${nsfrBreached ? 'text-red-600' : 'text-emerald-700'}`}>{stressedNsfr.toFixed(1)}%</p>
                <p className={`mt-1 ${nsfrBreached ? 'text-red-500' : 'text-emerald-600'}`}>
                  {nsfrBreached
                    ? `Breach by ${(100 - stressedNsfr).toFixed(1)}pp`
                    : `${(stressedNsfr - 100).toFixed(1)}pp headroom`}
                </p>
              </div>
            </div>
          )}

          {shock === 0 && (
            <p className="mt-3 text-xs text-gray-400">Move the slider to apply a stress scenario to both LCR and NSFR simultaneously.</p>
          )}
        </div>

        {data && data.active_alerts.length > 0 && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 space-y-1">
            <p className="font-semibold">⚠ Active Alerts ({data.active_alerts.length})</p>
            {data.active_alerts.map((a, i) => <p key={i}>{a}</p>)}
          </div>
        )}

        {/* LCR trend + simulator side by side on large screens */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* LCR trend chart */}
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="text-base font-semibold text-gray-800 mb-4">LCR Trend — EU Banking Sector (ECB Aggregate)</h2>
            {data && data.lcr_trend.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={data.lcr_trend}>
                  <defs>
                    <linearGradient id="lcrFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#10b981" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="period" tick={{ fontSize: 10 }} interval={3} />
                  <YAxis domain={['auto', 'auto']} tick={{ fontSize: 12 }} unit="%" />
                  <Tooltip content={<LcrTooltip />} />
                  <ReferenceLine y={100} stroke="#f59e0b" strokeDasharray="4 4" />
                  <Area type="monotone" dataKey="lcr_ratio" stroke="#10b981" fill="url(#lcrFill)" strokeWidth={2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-gray-400 text-center py-10">{data ? 'No trend data available.' : 'Loading…'}</p>
            )}
            <p className="mt-2 text-xs text-gray-400">Source: ECB Supervisory Banking Statistics | Dashed line = 100% regulatory minimum</p>
          </div>

          <ProFormaSimulator />
        </div>
      </div>
    </div>
  )
}
