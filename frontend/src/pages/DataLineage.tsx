const stages = [
  {
    id: 1,
    name: 'Source Layer',
    description: 'SAP / ERP export — raw CSV files',
    detail: 'Trade positions, cash flows, counterparty data, collateral postings. Generated daily at 18:00 CET.',
    color: 'bg-slate-100 border-slate-300 text-slate-700',
    dot: 'bg-slate-400',
  },
  {
    id: 2,
    name: 'Staging Layer',
    description: 'PostgreSQL — schema: staging',
    detail: 'Raw data loaded untouched. No transformations. Immutable audit trail for regulators. Retained 7 years.',
    color: 'bg-blue-50 border-blue-200 text-blue-700',
    dot: 'bg-blue-400',
  },
  {
    id: 3,
    name: 'Warehouse Layer',
    description: 'PostgreSQL — schema: warehouse',
    detail: 'Cleaned and standardised. SQL views apply Basel III mapping rules — e.g. HQLA classification, haircut factors, run-off rates.',
    color: 'bg-indigo-50 border-indigo-200 text-indigo-700',
    dot: 'bg-indigo-400',
  },
  {
    id: 4,
    name: 'Validation Layer',
    description: 'PostgreSQL — schema: validation',
    detail: 'Business rules fire against warehouse data. Results written to validation.rule_results. Failures block report generation.',
    color: 'bg-amber-50 border-amber-200 text-amber-700',
    dot: 'bg-amber-400',
  },
  {
    id: 5,
    name: 'Reporting Layer',
    description: 'FastAPI + React Dashboard',
    detail: 'LCR, NSFR, ALMM ratios served via REST API. This dashboard. Audience: Risk Managers, CFO, Regulators.',
    color: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    dot: 'bg-emerald-400',
  },
]

export default function DataLineage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Data Lineage</h1>
        <p className="text-sm text-gray-500 mt-1">End-to-end pipeline — source to report</p>
      </div>

      <div className="relative">
        {stages.map((stage, i) => (
          <div key={stage.id} className="flex gap-6 mb-2">
            {/* Timeline spine */}
            <div className="flex flex-col items-center w-8 shrink-0">
              <div className={`w-4 h-4 rounded-full border-2 border-white ring-2 ring-offset-1 ${stage.dot} mt-5`} />
              {i < stages.length - 1 && <div className="w-0.5 flex-1 bg-gray-200 mt-1" />}
            </div>

            {/* Card */}
            <div className={`mb-4 flex-1 rounded-xl border p-5 ${stage.color}`}>
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-base">{stage.name}</h2>
                <span className="text-xs font-mono opacity-60">{stage.id} / {stages.length}</span>
              </div>
              <p className="text-sm font-medium opacity-80 mt-0.5">{stage.description}</p>
              <p className="text-sm opacity-70 mt-2">{stage.detail}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-gray-200 bg-gray-50 p-5 text-sm text-gray-600">
        <p className="font-semibold text-gray-800 mb-2">Key design principles</p>
        <ul className="space-y-1 list-disc list-inside">
          <li>Data is <strong>never modified</strong> in the Staging layer — full audit trail preserved</li>
          <li>All Basel III mappings live in <strong>SQL views</strong> — versioned and reviewable by auditors</li>
          <li>Validation failures are <strong>logged with timestamps</strong> — not silently discarded</li>
          <li>Each layer has a <strong>clear business owner</strong>: Risk (Warehouse), IT (Staging), Compliance (Validation)</li>
        </ul>
      </div>
    </div>
  )
}
