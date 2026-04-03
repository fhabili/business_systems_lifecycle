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
    items: ['PostgreSQL 16', 'SQLAlchemy', 'Medallion Architecture'],
  },
  {
    category: 'AI / LLM',
    accent: '#D97706',
    bg: 'bg-amber-50',
    border: 'border-amber-100',
    badge: 'bg-amber-100 text-amber-700',
    items: ['Gemini API', 'Streaming JSON', 'Context injection'],
  },
]

export default function SystemArchitecture() {
  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: '#1B2A4A' }}>System Architecture</h1>
        <p className="text-sm text-gray-500 mt-1">
          End-to-end Record-to-Report lifecycle — three interconnected systems covering transaction origination, financial close controls, and regulatory reporting.
        </p>
      </div>

      {/* Three-tier architecture diagram (Slate/Navy) */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-4">Architecture Overview</h2>
        <div className="rounded-xl border border-gray-200 bg-white p-6 overflow-x-auto">
          <svg viewBox="0 0 720 88" className="w-full min-w-[560px]"
            aria-label="Three-tier architecture: Transaction Layer → Control Layer → Reporting Layer">
            <defs>
              <marker id="archArr" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto">
                <polygon points="0 0, 7 3.5, 0 7" fill="#64748b" />
              </marker>
            </defs>

            {/* Tier 1 */}
            <rect x="0" y="14" width="210" height="58" rx="10" fill="#f8fafc" stroke="#334155" strokeWidth="1.5" />
            <text x="105" y="31" textAnchor="middle" fontSize="8.5" fontWeight="700" fill="#64748b" letterSpacing="1.5">TRANSACTION LAYER</text>
            <text x="105" y="47" textAnchor="middle" fontSize="11" fontWeight="700" fill="#1e293b">ERP Ledger Posting</text>
            <text x="105" y="62" textAnchor="middle" fontSize="8.5" fill="#64748b">Python · PostgreSQL · SQLAlchemy</text>

            <line x1="212" y1="43" x2="246" y2="43" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#archArr)" />

            {/* Tier 2 */}
            <rect x="248" y="14" width="222" height="58" rx="10" fill="#f8fafc" stroke="#334155" strokeWidth="1.5" />
            <text x="359" y="31" textAnchor="middle" fontSize="8.5" fontWeight="700" fill="#64748b" letterSpacing="1.5">CONTROL LAYER</text>
            <text x="359" y="47" textAnchor="middle" fontSize="11" fontWeight="700" fill="#1e293b">Financial Close Validation</text>
            <text x="359" y="62" textAnchor="middle" fontSize="8.5" fill="#64748b">Python · FastAPI · Pydantic v2</text>

            <line x1="472" y1="43" x2="506" y2="43" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#archArr)" />

            {/* Tier 3 — filled navy */}
            <rect x="508" y="14" width="212" height="58" rx="10" fill="#1B2A4A" stroke="#1B2A4A" strokeWidth="1.5" />
            <text x="614" y="31" textAnchor="middle" fontSize="8.5" fontWeight="700" fill="#94a3b8" letterSpacing="1.5">REPORTING LAYER</text>
            <text x="614" y="47" textAnchor="middle" fontSize="11" fontWeight="700" fill="#f1f5f9">Basel III Dashboard</text>
            <text x="614" y="62" textAnchor="middle" fontSize="8.5" fill="#94a3b8">React · FastAPI · PostgreSQL</text>
          </svg>
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

      {/* Repository Overview */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-5">Repository Overview</h2>
        <div className="flex flex-col md:flex-row items-stretch gap-0">
          {REPOS.map((box, i) => (
            <>
              <RepoCard key={box.repoLabel} box={box} index={i} />
              {i < REPOS.length - 1 && <ArchFlowArrow key={`arrow-${i}`} />}
            </>
          ))}
        </div>
      </div>
    </div>
  )
}

