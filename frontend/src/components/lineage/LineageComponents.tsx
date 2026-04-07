import { useState } from 'react'
import { ArrowDown, ArrowRight } from 'lucide-react'
import type { Layer, Metric, TraceStep } from './lineageData'
import { buildTrace, QUARTERS } from './lineageData'

// ── blueprint 3-column cards ─────────────────────────────────────────────────

const BLUEPRINT_CARDS = [
  {
    col: '01',
    title: 'Source Ingestion (ERP Mock)',
    subtitle: 'Data Source',
    description: 'Simulates ledger posting and extraction from core banking systems.',
    repo: 'https://github.com/fhabili/erp_ledger_posting',
    dot: '#1B2A4A',
    accent: '#1B2A4A',
    tech: [
      { label: 'Python',     color: '#3b82f6' },
      { label: 'PostgreSQL', color: '#6366f1' },
      { label: 'CSV',        color: '#6b7280' },
    ],
  },
  {
    col: '02',
    title: 'Automated Validation',
    subtitle: 'Validation Engine',
    description: 'SQL-based integrity checks and Basel III logic application.',
    repo: 'https://github.com/fhabili/financial_close_validation',
    dot: '#F59E0B',
    accent: '#d97706',
    tech: [
      { label: 'SQL',     color: '#f59e0b' },
      { label: 'Python',  color: '#3b82f6' },
      { label: 'FastAPI', color: '#10b981' },
    ],
  },
  {
    col: '03',
    title: 'Executive Delivery',
    subtitle: 'Intelligence Layer',
    description: 'React-driven visualization of LCR/NSFR intelligence.',
    repo: 'https://github.com/fhabili/business_systems_lifecycle',
    dot: '#10B981',
    accent: '#059669',
    tech: [
      { label: 'React',      color: '#06b6d4' },
      { label: 'TypeScript', color: '#2563eb' },
      { label: 'FastAPI',    color: '#10b981' },
    ],
  },
]

// GitHub icon (inline SVG, no dependency needed)
function GithubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
    </svg>
  )
}

export function BlueprintCards() {
  return (
    <div className="flex flex-col md:flex-row items-stretch gap-0">
      {BLUEPRINT_CARDS.map((card, i) => (
        <div key={card.col} className="flex flex-col md:flex-row items-stretch flex-1 min-w-0">
          {/* Card */}
          <div className="flex-1 min-w-0 bg-white/80 backdrop-blur-sm border border-[#E2E8F0] rounded-xl shadow-sm p-5 relative">
            {/* GitHub link */}
            <a
              href={card.repo}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute top-3 right-3 text-gray-300 hover:text-gray-700 transition-colors"
              title={card.repo}
            >
              <GithubIcon className="w-4 h-4" />
            </a>

            {/* Column number */}
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{card.col}</span>

            {/* Accent dot + subtitle */}
            <div className="flex items-center gap-2 mt-1.5 mb-2">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: card.dot }} />
              <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: card.accent }}>
                {card.subtitle}
              </span>
            </div>

            <h3 className="font-bold text-sm text-gray-900 leading-tight mb-2">{card.title}</h3>
            <p className="text-xs text-gray-500 leading-relaxed mb-4">{card.description}</p>

            {/* Tech badges — grayscale → color on hover */}
            <div className="flex flex-wrap gap-1.5">
              {card.tech.map(t => (
                <span
                  key={t.label}
                  className="text-[10px] font-semibold px-2 py-0.5 rounded-full border border-gray-200 text-gray-400 transition-all duration-200 cursor-default"
                  onMouseEnter={e => {
                    e.currentTarget.style.backgroundColor = t.color
                    e.currentTarget.style.color = '#fff'
                    e.currentTarget.style.borderColor = 'transparent'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.backgroundColor = ''
                    e.currentTarget.style.color = ''
                    e.currentTarget.style.borderColor = ''
                  }}
                >
                  {t.label}
                </span>
              ))}
            </div>
          </div>

          {/* Animated arrow connector */}
          {i < BLUEPRINT_CARDS.length - 1 && (
            <div className="hidden md:flex items-center justify-center w-14 shrink-0">
              <svg width="44" height="16" viewBox="0 0 44 16" overflow="visible">
                <line x1="0" y1="8" x2="32" y2="8" stroke="#6366f1" strokeWidth="1.5" strokeDasharray="4 3">
                  <animate attributeName="stroke-dashoffset" from="7" to="0" dur="0.5s" begin={`${i * 0.18}s`} repeatCount="indefinite" />
                </line>
                <path d="M32 4 L44 8 L32 12" fill="none" stroke="#6366f1" strokeWidth="1.5" strokeLinejoin="round" />
              </svg>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// ── animated flow arrow ──────────────────────────────────────────────────────

export function FlowArrow() {
  return (
    <div className="flex justify-center items-center h-8 my-0">
      <div className="flex flex-col items-center gap-0.5 animate-bounce">
        <div className="w-0.5 h-3 bg-gray-300 rounded" />
        <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
          <path d="M6 8L0 0h12L6 8z" fill="#d1d5db" />
        </svg>
      </div>
    </div>
  )
}

// ── expandable layer card ────────────────────────────────────────────────────

export function LayerCard({ layer, index, total, isOpen, onToggle, highlightTable }: {
  layer: Layer; index: number; total: number
  isOpen: boolean; onToggle: () => void; highlightTable?: string
}) {
  return (
    <>
      <div
        className={`rounded-xl border border-[#E2E8F0] bg-white shadow-sm cursor-pointer select-none transition-all hover:shadow-md ${highlightTable ? 'ring-2 ring-amber-300 shadow-md' : ''}`}
        onClick={onToggle}
      >
        <div className="flex items-center justify-between px-5 py-4">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${layer.dot} shrink-0`} />
            <div>
              <span className="font-bold text-sm">{layer.name}</span>
              <span className="ml-2 text-xs opacity-60 font-normal">{layer.description}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono opacity-50">{index + 1} / {total}</span>
            <svg className={`w-4 h-4 opacity-50 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {isOpen && (
          <div className="px-5 pb-5 border-t border-current border-opacity-10 pt-4 space-y-4" onClick={e => e.stopPropagation()}>
            <p className="text-sm opacity-80 leading-relaxed">{layer.detail}</p>
            <div className="rounded-lg bg-white bg-opacity-60 border border-current border-opacity-10 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide opacity-60 mb-1">Why this matters</p>
              <p className="text-sm leading-relaxed">{layer.whyItMatters}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide opacity-60 mb-2">Tables / endpoints</p>
              <div className="space-y-2">
                {layer.tables.map(t => (
                    <div key={t.name} className={`rounded-lg bg-white bg-opacity-60 border p-3 transition-colors ${t.name === highlightTable ? 'border-amber-400 ring-2 ring-amber-200' : 'border-current border-opacity-10'}`}>
                    <div className="flex items-center justify-between mb-1.5">
                      <code className="text-xs font-mono font-semibold">{t.name}</code>
                      {t.rows != null && (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white bg-opacity-80">
                          {t.rows.toLocaleString()} rows
                        </span>
                      )}
                    </div>
                    <p className="text-xs opacity-60 font-mono">{t.fields.join(' · ')}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      {index < total - 1 && <FlowArrow />}
    </>
  )
}

// ── data flow diagram (SVG) ──────────────────────────────────────────────────

export function DataFlowDiagram() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6">
      <h2 className="text-base font-semibold text-slate-900 mb-1">Data Flow Overview</h2>
      <p className="text-xs text-slate-500 mb-5">Every regulatory metric follows the same governed path: from authoritative source, through preservation and regulatory logic, to controlled delivery and final reporting output.</p>
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-stretch mb-8 overflow-x-auto">
        {/* Node 1: Source Data */}
        <div className="w-full md:w-auto flex-1 rounded-xl border border-slate-200 border-t-4 border-t-amber-500 bg-white p-4 flex flex-col justify-center text-center">
          <p className="text-xs font-bold text-slate-900">Source</p>
          <p className="text-[10px] text-slate-500">ECB and Bundesbank</p>
        </div>

        {/* Arrow — Responsive */}
        <div className="flex md:items-center md:shrink-0 w-full md:w-auto justify-center">
          <div className="block md:hidden">
            <ArrowDown className="w-6 h-6 text-slate-300" />
          </div>
          <div className="hidden md:block">
            <ArrowRight className="w-6 h-6 text-slate-300" />
          </div>
        </div>

        {/* Node 2: Data Archive */}
        <div className="w-full md:w-auto flex-1 rounded-xl border border-slate-200 border-t-4 border-t-amber-500 bg-white p-4 flex flex-col justify-center text-center">
          <p className="text-xs font-bold text-slate-900">Preservation</p>
          <p className="text-[10px] text-slate-500">Immutable Record</p>
        </div>

        {/* Arrow — Responsive */}
        <div className="flex md:items-center md:shrink-0 w-full md:w-auto justify-center">
          <div className="block md:hidden">
            <ArrowDown className="w-6 h-6 text-slate-300" />
          </div>
          <div className="hidden md:block">
            <ArrowRight className="w-6 h-6 text-slate-300" />
          </div>
        </div>

        {/* Node 3: Data Warehouse */}
        <div className="w-full md:w-auto flex-1 rounded-xl border border-slate-200 border-t-4 border-t-amber-500 bg-white p-4 flex flex-col justify-center text-center">
          <p className="text-xs font-bold text-slate-900">Calculation</p>
          <p className="text-[10px] text-slate-500">Regulatory Logic Applied</p>
        </div>

        {/* Arrow — Responsive */}
        <div className="flex md:items-center md:shrink-0 w-full md:w-auto justify-center">
          <div className="block md:hidden">
            <ArrowDown className="w-6 h-6 text-slate-300" />
          </div>
          <div className="hidden md:block">
            <ArrowRight className="w-6 h-6 text-slate-300" />
          </div>
        </div>

        {/* Node 4: Data Service */}
        <div className="w-full md:w-auto flex-1 rounded-xl border border-slate-200 border-t-4 border-t-amber-500 bg-white p-4 flex flex-col justify-center text-center">
          <p className="text-xs font-bold text-slate-900">Delivery</p>
          <p className="text-[10px] text-slate-500">Governed Metrics</p>
        </div>

        {/* Arrow — Responsive */}
        <div className="flex md:items-center md:shrink-0 w-full md:w-auto justify-center">
          <div className="block md:hidden">
            <ArrowDown className="w-6 h-6 text-slate-300" />
          </div>
          <div className="hidden md:block">
            <ArrowRight className="w-6 h-6 text-slate-300" />
          </div>
        </div>

        {/* Node 5: Dashboard */}
        <div className="w-full md:w-auto flex-1 rounded-xl border border-slate-200 border-t-4 border-t-amber-500 bg-white p-4 flex flex-col justify-center text-center">
          <p className="text-xs font-bold text-slate-900">Reporting</p>
          <p className="text-[10px] text-slate-500">Executive Terminal</p>
        </div>
      </div>
    </div>
  )
}

// ── trace panel ──────────────────────────────────────────────────────────────

const STEP_CIRCLE = [
  'bg-slate-200 text-slate-700 border border-slate-300',
  'bg-blue-100 text-blue-700 border border-blue-200',
  'bg-indigo-100 text-indigo-700 border border-indigo-200',
  'bg-emerald-100 text-emerald-700 border border-emerald-200',
  'bg-emerald-200 text-emerald-800 border border-emerald-300',
]

export function TracePanel({ onTrace }: { onTrace: (metric: Metric, quarter: string) => void }) {
  const [metric, setMetric] = useState<Metric>('LCR ratio')
  const [quarter, setQuarter] = useState(QUARTERS[0])
  const [traced, setTraced] = useState(false)
  const steps: TraceStep[] = buildTrace(metric, quarter)

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-5">
      <div>
        <h2 className="text-lg font-bold text-slate-900">Trace a Number</h2>
        <p className="text-sm text-slate-500 mt-1">Select a metric and reporting period to trace how the final figure was sourced, validated, transformed, and delivered to the dashboard.</p>
      </div>
      <div className="flex flex-wrap gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Metric</label>
          <select value={metric} onChange={e => { setMetric(e.target.value as Metric); setTraced(false) }}
            className="text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-300">
            <option>LCR ratio</option>
            <option>NSFR ratio</option>
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Quarter</label>
          <select value={quarter} onChange={e => { setQuarter(e.target.value); setTraced(false) }}
            className="text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-300">
            {QUARTERS.map(q => <option key={q}>{q}</option>)}
          </select>
        </div>
        <div className="flex flex-col justify-end">
          <button onClick={() => { setTraced(true); onTrace(metric, quarter) }}
            className="text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors bg-amber-600 hover:bg-amber-700">
            Trace →
          </button>
        </div>
      </div>
      {traced && (
        <div className="pt-2">
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide mb-4">Lineage Trace: {metric} · {quarter}</p>
          <div className="relative pl-2">
            {/* Vertical connector line */}
            <div className="absolute left-[19px] top-4 bottom-4 w-px bg-slate-200" />
            <div className="space-y-0">
              {steps.map((step, i) => (
                <div key={step.layer} className="relative flex items-start gap-3 pb-4 last:pb-0">
                  {/* Step circle */}
                  <div className={`relative z-10 flex items-center justify-center w-7 h-7 rounded-full text-[10px] font-bold shrink-0 mt-0.5 ${STEP_CIRCLE[i]}`}>
                    {i + 1}
                  </div>
                  {/* Content card */}
                  <div className={`flex-1 min-w-0 rounded-lg border bg-white p-3 ${step.color}`}>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-amber-500 mb-1">{step.layer}</p>
                    <p className="text-xs text-slate-500 leading-relaxed">{step.detail}</p>
                    {i === 0 && (
                      <div className="mt-2.5 rounded border border-amber-200 bg-white px-3 py-2">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-amber-500 mb-0.5">Regulatory Mapping</p>
                        <p className="text-xs text-slate-500 leading-relaxed">
                          Source fields are aligned to the internal Basel III metric structure before entering the governed reporting pipeline.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
