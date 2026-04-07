import { ArrowRight, ArrowDown } from 'lucide-react'
import { REPOS } from '../components/architecture/archData'
import { RepoCard, ArchFlowArrow } from '../components/architecture/ArchComponents'

const TECH_STACK = [
  {
    category: 'Frontend',
    accent: '#2563EB',
    bg: 'bg-blue-50',
    border: 'border-blue-100',
    badge: 'bg-blue-100 text-blue-700',
    items: ['React 18', 'TypeScript', 'Tailwind CSS', 'Recharts', 'Lucide React', 'Vite'],
  },
  {
    category: 'Backend',
    accent: '#059669',
    bg: 'bg-emerald-50',
    border: 'border-emerald-100',
    badge: 'bg-emerald-100 text-emerald-700',
    items: ['Python 3.12', 'FastAPI', 'Pydantic v2', 'Alembic', 'uv'],
  },
  {
    category: 'Data',
    accent: '#334155',
    bg: 'bg-slate-50',
    border: 'border-slate-200',
    badge: 'bg-slate-100 text-slate-700',
    items: ['PostgreSQL 16', 'SQLAlchemy', 'Medallion Architecture', 'BCBS 239 Compliant Lineage'],
  },
  {
    category: 'AI Layer',
    accent: '#D97706',
    bg: 'bg-amber-50',
    border: 'border-amber-100',
    badge: 'bg-amber-100 text-amber-700',
    items: ['Gemini API', 'Context Injection', 'Streaming JSON'],
  },
]

export default function SystemArchitecture() {
  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: '#1B2A4A' }}>System Architecture</h1>
        <p className="text-sm text-gray-500 mt-1">
          Record-to-Report lifecycle across three connected system layers
        </p>
      </div>

      <div className="flex gap-3 rounded-xl border border-slate-200 border-t-4 border-t-gray-500 bg-white px-5 py-4">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0 text-gray-500"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" /></svg>
        <p className="text-sm text-slate-600 leading-relaxed">
          <span className="font-semibold">About this page: </span>
          This view explains how the platform turns source data into governed regulatory metrics. The Transaction Layer captures financial events, the Control Layer applies validation rules, and the Reporting Layer delivers trusted output to the dashboard.
        </p>
      </div>

      {/* Architecture Overview — Pipeline Flow */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-0">
          {/* Transaction Layer */}
          <div className="flex-1 w-full rounded-lg border border-gray-200 border-t-4 border-t-blue-500 bg-white p-6">
            <p className="text-xs font-bold uppercase tracking-widest text-blue-500 mb-2">Transaction Layer</p>
            <h3 className="text-sm font-bold text-gray-900 mb-2">ERP Origination</h3>
            <p className="text-sm text-gray-500">Captures financial events as auditable journal entries</p>
          </div>

          {/* Arrow — Responsive */}
          <div className="flex justify-center py-3 md:py-0 md:px-3 md:flex-shrink-0 w-full md:w-auto">
            <div className="block md:hidden">
              <ArrowDown size={24} color="#9CA3AF" />
            </div>
            <div className="hidden md:block">
              <ArrowRight size={24} color="#9CA3AF" />
            </div>
          </div>

          {/* Control Layer */}
          <div className="flex-1 w-full rounded-lg border border-gray-200 border-t-4 border-t-amber-500 bg-white p-6">
            <p className="text-xs font-bold uppercase tracking-widest text-amber-500 mb-2">Control Layer</p>
            <h3 className="text-sm font-bold text-gray-900 mb-2">Close Validation</h3>
            <p className="text-sm text-gray-500">Applies validation rules before data reaches reporting</p>
          </div>

          {/* Arrow — Responsive */}
          <div className="flex justify-center py-3 md:py-0 md:px-3 md:flex-shrink-0 w-full md:w-auto">
            <div className="block md:hidden">
              <ArrowDown size={24} color="#9CA3AF" />
            </div>
            <div className="hidden md:block">
              <ArrowRight size={24} color="#9CA3AF" />
            </div>
          </div>

          {/* Reporting Layer */}
          <div className="flex-1 w-full rounded-lg border border-gray-200 border-t-4 border-t-emerald-500 bg-white p-6">
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-500 mb-2">Reporting Layer</p>
            <h3 className="text-sm font-bold text-gray-900 mb-2">Regulatory Reporting</h3>
            <p className="text-sm text-gray-500">Delivers trusted Basel III metrics with full lineage</p>
          </div>
        </div>
      </div>

      {/* Technical Stack Overview */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-4">Technical Stack</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {TECH_STACK.map(cat => (
            <div key={cat.category} className={`rounded-xl border ${cat.border} ${cat.bg} p-4`}>
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: cat.accent }}>
                {cat.category}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {cat.items.map(item => (
                  <span key={item} className={`text-xs font-medium px-2 py-0.5 rounded-full ${cat.badge}`}>{item}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* System Layers */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-5">System Layers</h2>
        <div className="flex flex-col md:flex-row items-stretch gap-0">
          {REPOS.map((box, i) => (
            <>
              <RepoCard key={box.repoLabel} box={box} />
              {i < REPOS.length - 1 && <ArchFlowArrow key={`arrow-${i}`} />}
            </>
          ))}
        </div>
      </div>
    </div>
  )
}

