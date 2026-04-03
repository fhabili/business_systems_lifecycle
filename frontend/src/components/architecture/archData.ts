export interface RepoBox {
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

export const REPOS: RepoBox[] = [
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
    icon: 'TXN',
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
    icon: 'CTL',
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
    icon: 'RPT',
  },
]

export const PHILOSOPHY = [
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
