// ── component definitions ────────────────────────────────────────────────────

interface RepoBox {
  layer: string
  title: string
  subtitle: string
  description: string
  tech: { label: string; color: string }[]
  repo: string
  repoLabel: string
  accent: string
  border: string
  icon: string
}

const REPOS: RepoBox[] = [
  {
    layer: 'Transaction Layer',
    title: 'ERP Ledger Posting Simulation',
    subtitle: 'Record-to-Report — Origin',
    description:
      'Simulates the upstream accounting system that generates journal entries, subledger postings, and cash flow events. Produces the raw financial data that flows downstream into the validation and reporting pipeline. Acts as the system of record for all transactional positions.',
    tech: [
      { label: 'Python', color: 'bg-blue-100 text-blue-700' },
      { label: 'PostgreSQL', color: 'bg-indigo-100 text-indigo-700' },
      { label: 'SQLAlchemy', color: 'bg-slate-100 text-slate-700' },
    ],
    repo: 'https://github.com/fhabili/erp_ledger_posting',
    repoLabel: 'fhabili/erp_ledger_posting',
    accent: 'text-slate-700',
    border: 'border-slate-300',
    icon: '🏦',
  },
  {
    layer: 'Control Layer',
    title: 'Financial Close Validation Engine',
    subtitle: 'Record-to-Report — Controls',
    description:
      'Applies automated financial close controls: period-end reconciliation checks, sub-ledger to general ledger tie-outs, intercompany elimination validation, and trial balance integrity rules. Failures block promotion of data to the reporting layer — ensuring only clean, validated figures reach regulators.',
    tech: [
      { label: 'Python', color: 'bg-blue-100 text-blue-700' },
      { label: 'FastAPI', color: 'bg-emerald-100 text-emerald-700' },
      { label: 'Pydantic', color: 'bg-purple-100 text-purple-700' },
      { label: 'PostgreSQL', color: 'bg-indigo-100 text-indigo-700' },
    ],
    repo: 'https://github.com/fhabili/financial_close_validation',
    repoLabel: 'fhabili/financial_close_validation',
    accent: 'text-amber-700',
    border: 'border-amber-300',
    icon: '✅',
  },
  {
    layer: 'Reporting Layer',
    title: 'Basel III Regulatory Dashboard',
    subtitle: 'Record-to-Report — Output',
    description:
      'Consumes validated warehouse data to compute and present LCR, NSFR, and ALMM ratios in real time. Provides a full audit trail from source file to dashboard figure. Designed for Risk Managers, CFOs, and Regulators who need to understand compliance posture at a glance and drill into any number on demand.',
    tech: [
      { label: 'FastAPI', color: 'bg-emerald-100 text-emerald-700' },
      { label: 'React + TypeScript', color: 'bg-sky-100 text-sky-700' },
      { label: 'Recharts', color: 'bg-violet-100 text-violet-700' },
      { label: 'Tailwind CSS', color: 'bg-cyan-100 text-cyan-700' },
      { label: 'Claude AI', color: 'bg-orange-100 text-orange-700' },
    ],
    repo: 'https://github.com/fhabili/business_systems_lifecycle',
    repoLabel: 'fhabili/business_systems_lifecycle',
    accent: 'text-emerald-700',
    border: 'border-emerald-300',
    icon: '📊',
  },
]

const PHILOSOPHY = [
  {
    title: 'Separation of concerns across layers',
    body: 'Each system has exactly one responsibility: generate (ERP), control (validation engine), report (this dashboard). No layer ever reaches back into an upstream layer\'s database directly. This makes each component independently testable, auditable, and replaceable — critical for a heavily regulated environment where IT and Risk are owned by different teams.',
  },
  {
    title: 'Immutability at every hand-off',
    body: 'Data is never modified in transit. The ERP produces immutable journal entries; the validation engine reads them without alteration; the dashboard reads validated warehouse views. Every hand-off is append-only. This design satisfies the ECB\'s data lineage requirements under SSM Regulation Article 10 and ensures a full audit trail from booking to board report.',
  },
  {
    title: 'Fail-loud, not fail-silent',
    body: 'Validation failures block data promotion. A failed control check does not produce a zero, a null, or a default — it stops the pipeline and raises a logged alert. This is intentional: in regulatory reporting, a silent data error is far more dangerous than a visible pipeline failure. Risk managers can trust that if the dashboard is showing numbers, those numbers have passed controls.',
  },
  {
    title: 'Designed for interview-ability, not just functionality',
    body: 'Every architectural decision in this system can be traced to a real business requirement: the staging layer exists because regulators require 7-year retention; the validation engine exists because SOX and CRD IV require segregation of controls from reporting; the AI assistant exists because analysts spend more time explaining ratios to stakeholders than computing them. This is a portfolio that demonstrates understanding of why systems are built the way they are — not just how.',
  },
]

// ── flow arrow ────────────────────────────────────────────────────────────────

function FlowArrow() {
  return (
    <div className="hidden md:flex flex-col items-center justify-center px-2 shrink-0" style={{ width: 56 }}>
      <div className="flex items-center gap-0">
        <div className="h-0.5 w-8 bg-gray-300" />
        <div className="w-0 h-0 border-y-4 border-y-transparent border-l-8 border-l-gray-300" />
      </div>
      <p className="text-xs text-gray-400 mt-1 text-center leading-tight whitespace-nowrap">data flow</p>
    </div>
  )
}

// ── repo card ─────────────────────────────────────────────────────────────────

function RepoCard({ box, index }: { box: RepoBox; index: number }) {
  return (
    <div className={`flex-1 min-w-0 rounded-xl border-2 ${box.border} bg-white flex flex-col`}>
      {/* layer badge */}
      <div className={`px-5 py-2 border-b ${box.border} bg-gray-50 rounded-t-xl`}>
        <span className={`text-xs font-bold uppercase tracking-widest ${box.accent}`}>
          {String(index + 1).padStart(2, '0')} — {box.layer}
        </span>
      </div>

      <div className="p-5 flex flex-col gap-4 flex-1">
        {/* title */}
        <div className="flex items-start gap-3">
          <span className="text-2xl shrink-0">{box.icon}</span>
          <div>
            <h3 className="font-bold text-gray-900 text-base leading-tight">{box.title}</h3>
            <p className={`text-xs font-medium mt-0.5 ${box.accent}`}>{box.subtitle}</p>
          </div>
        </div>

        {/* description */}
        <p className="text-sm text-gray-600 leading-relaxed flex-1">{box.description}</p>

        {/* tech stack */}
        <div className="flex flex-wrap gap-1.5">
          {box.tech.map(t => (
            <span key={t.label} className={`text-xs font-semibold px-2 py-0.5 rounded-full ${t.color}`}>
              {t.label}
            </span>
          ))}
        </div>

        {/* repo link */}
        <a
          href={box.repo}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-xs text-gray-500 hover:text-indigo-600 transition-colors group"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current shrink-0" aria-hidden>
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
          </svg>
          <span className="font-mono group-hover:underline">{box.repoLabel}</span>
        </a>
      </div>
    </div>
  )
}

// ── page ─────────────────────────────────────────────────────────────────────

export default function SystemArchitecture() {
  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">System Architecture</h1>
        <p className="text-sm text-gray-500 mt-1">
          Full Record-to-Report lifecycle — three interconnected systems covering transaction, control, and reporting layers.
        </p>
      </div>

      {/* flow diagram */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-5">End-to-End Pipeline</h2>
        <div className="flex flex-col md:flex-row items-stretch gap-0">
          {REPOS.map((box, i) => (
            <>
              <RepoCard key={box.repoLabel} box={box} index={i} />
              {i < REPOS.length - 1 && <FlowArrow key={`arrow-${i}`} />}
            </>
          ))}
        </div>
        <p className="mt-4 text-xs text-gray-400 text-center">
          Data flows left → right: ERP generates &rarr; Validation engine controls &rarr; Dashboard reports
        </p>
      </div>

      {/* BSA design philosophy */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-5">BSA Design Philosophy</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {PHILOSOPHY.map((p, i) => (
            <div key={i} className="rounded-xl border border-gray-200 bg-white p-5">
              <div className="flex items-start gap-3">
                <span className="shrink-0 w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center mt-0.5">
                  {i + 1}
                </span>
                <div>
                  <p className="font-semibold text-gray-800 text-sm">{p.title}</p>
                  <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">{p.body}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* tech summary table */}
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-4">Technology Summary</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="pb-2 font-semibold text-gray-600 pr-6">Component</th>
                <th className="pb-2 font-semibold text-gray-600 pr-6">Language</th>
                <th className="pb-2 font-semibold text-gray-600 pr-6">Framework</th>
                <th className="pb-2 font-semibold text-gray-600">Database</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr>
                <td className="py-2 pr-6 text-gray-700 font-medium">ERP Ledger Posting Simulation</td>
                <td className="py-2 pr-6 text-gray-500">Python 3.12</td>
                <td className="py-2 pr-6 text-gray-500">SQLAlchemy 2.0</td>
                <td className="py-2 text-gray-500">PostgreSQL 16</td>
              </tr>
              <tr>
                <td className="py-2 pr-6 text-gray-700 font-medium">Financial Close Validation Engine</td>
                <td className="py-2 pr-6 text-gray-500">Python 3.12</td>
                <td className="py-2 pr-6 text-gray-500">FastAPI + Pydantic</td>
                <td className="py-2 text-gray-500">PostgreSQL 16</td>
              </tr>
              <tr>
                <td className="py-2 pr-6 text-gray-700 font-medium">Basel III Regulatory Dashboard</td>
                <td className="py-2 pr-6 text-gray-500">Python + TypeScript</td>
                <td className="py-2 pr-6 text-gray-500">FastAPI + React + Vite</td>
                <td className="py-2 text-gray-500">PostgreSQL 16</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* who is this for */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-5">Who is this for?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 flex flex-col gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-xl shrink-0">🏢</div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">Finance Teams at Scale-ups</p>
              <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">
                If your team is producing regulatory or management reports manually, this architecture shows how to automate the source-to-report pipeline with full audit trail.
              </p>
            </div>
          </div>
          <div className="rounded-xl border border-amber-200 bg-white p-5 flex flex-col gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-xl shrink-0">🔍</div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">Risk &amp; Compliance Analysts</p>
              <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">
                If you need to explain to auditors or regulators where a number comes from, the lineage layer gives you that answer instantly.
              </p>
            </div>
          </div>
          <div className="rounded-xl border border-indigo-200 bg-white p-5 flex flex-col gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-xl shrink-0">📋</div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">BSA / Systems Analyst Hiring Managers</p>
              <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">
                This project demonstrates end-to-end systems thinking: requirements definition, data architecture, validation logic, and reporting — not just code.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
