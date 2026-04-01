import { useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  Cell, ResponsiveContainer,
} from 'recharts'

// ── data ─────────────────────────────────────────────────────────────────────

interface FailedRow { [key: string]: string | number }

interface Rule {
  id: string
  name: string
  severity: 'Critical' | 'High' | 'Medium' | 'Low'
  regulatoryImpact: 'High' | 'Medium' | 'Low'
  passed: number
  failed: number
  total: number
  tooltip: string
  failedRows: { columns: string[]; rows: FailedRow[]; issue: string }
}

const RULES: Rule[] = [
  {
    id: 'DQ-001', name: 'Missing Counterparty LEI', severity: 'Critical', regulatoryImpact: 'High',
    passed: 847, failed: 3, total: 850,
    tooltip: 'Every counterparty in a liquidity flow must have a valid Legal Entity Identifier (LEI). Without it, regulators cannot identify who owes whom — making the LCR counterparty concentration limit impossible to verify.',
    failedRows: {
      columns: ['record_id', 'counterparty_name', 'lei', 'flow_type', 'amount_eur'],
      issue: 'lei',
      rows: [
        { record_id: 'CF-20250331-0041', counterparty_name: 'Meridian Capital GmbH', lei: '', flow_type: 'OUTFLOW', amount_eur: 4200000 },
        { record_id: 'CF-20250331-0188', counterparty_name: 'Vega Finance SRL', lei: '', flow_type: 'OUTFLOW', amount_eur: 870000 },
        { record_id: 'CF-20250331-0412', counterparty_name: 'Unknown Entity', lei: 'N/A', flow_type: 'INFLOW', amount_eur: 150000 },
      ],
    },
  },
  {
    id: 'DQ-002', name: 'Negative Liquidity Buffer', severity: 'Critical', regulatoryImpact: 'High',
    passed: 850, failed: 0, total: 850,
    tooltip: 'HQLA (High Quality Liquid Assets) must always be non-negative. A negative buffer is mathematically impossible under the LCR framework and indicates a data feed error or sign convention mismatch.',
    failedRows: { columns: [], rows: [], issue: '' },
  },
  {
    id: 'DQ-003', name: 'LCR Ratio Out of Tolerance (>5% MoM swing)', severity: 'High', regulatoryImpact: 'High',
    passed: 849, failed: 1, total: 850,
    tooltip: 'A month-on-month LCR swing greater than 5 percentage points is flagged for human review. It may indicate a genuine stress event, a data error, or a reclassification of assets. Regulators expect institutions to explain large ratio movements.',
    failedRows: {
      columns: ['bank_id', 'period', 'lcr_prev', 'lcr_curr', 'swing_pp'],
      issue: 'swing_pp',
      rows: [
        { bank_id: 'ECB_EU_AGGREGATE', period: '2025 Q1', lcr_prev: 162.4, lcr_curr: 158.6, swing_pp: -3.8 },
      ],
    },
  },
  {
    id: 'DQ-004', name: 'Missing Maturity Date on Flow', severity: 'Medium', regulatoryImpact: 'Medium',
    passed: 843, failed: 7, total: 850,
    tooltip: 'Every cash flow in the 30-day horizon must have a maturity date so run-off rates can be applied correctly. Missing maturities mean the flow cannot be assigned to the right LCR bucket under CRR Article 425.',
    failedRows: {
      columns: ['record_id', 'flow_type', 'maturity_date', 'amount_eur', 'asset_class'],
      issue: 'maturity_date',
      rows: [
        { record_id: 'FL-20250331-0072', flow_type: 'OUTFLOW', maturity_date: '', amount_eur: 320000, asset_class: 'UNSECURED' },
        { record_id: 'FL-20250331-0119', flow_type: 'OUTFLOW', maturity_date: '', amount_eur: 55000, asset_class: 'RETAIL_DEPOSIT' },
        { record_id: 'FL-20250331-0204', flow_type: 'INFLOW', maturity_date: 'NULL', amount_eur: 1100000, asset_class: 'SECURED_HQLA' },
      ],
    },
  },
  {
    id: 'DQ-005', name: 'Collateral Value Below Threshold', severity: 'Medium', regulatoryImpact: 'Medium',
    passed: 850, failed: 0, total: 850,
    tooltip: 'Collateral posted against secured funding must have a market value above the contractually agreed haircut floor. If collateral falls below this level, the funding counts as unsecured — increasing the run-off rate used in the LCR denominator.',
    failedRows: { columns: [], rows: [], issue: '' },
  },
  {
    id: 'DQ-006', name: 'Currency Mismatch on Settlement', severity: 'Low', regulatoryImpact: 'Low',
    passed: 848, failed: 2, total: 850,
    tooltip: 'When the settlement currency of a flow differs from the reporting currency (EUR) without a matching FX hedge, the net cash flow figure may be understated or overstated. This is a Low severity flag because small FX mismatches rarely affect the ratio materially.',
    failedRows: {
      columns: ['record_id', 'flow_currency', 'settlement_currency', 'fx_hedge', 'amount_eur'],
      issue: 'fx_hedge',
      rows: [
        { record_id: 'FX-20250331-0033', flow_currency: 'USD', settlement_currency: 'EUR', fx_hedge: 'NONE', amount_eur: 210000 },
        { record_id: 'FX-20250331-0091', flow_currency: 'GBP', settlement_currency: 'EUR', fx_hedge: 'NONE', amount_eur: 88000 },
      ],
    },
  },
]

// ── severity config ───────────────────────────────────────────────────────────

const SEV_BADGE: Record<string, string> = {
  Critical: 'bg-red-100 text-red-700',
  High: 'bg-amber-100 text-amber-700',
  Medium: 'bg-yellow-100 text-yellow-700',
  Low: 'bg-blue-100 text-blue-700',
}
const SEV_BAR: Record<string, string> = {
  Critical: '#ef4444',
  High: '#f97316',
  Medium: '#eab308',
  Low: '#3b82f6',
}

// ── global health gauge (SVG semicircle) ────────────────────────────────────

function HealthGauge({ score }: { score: number }) {
  const color = score >= 97 ? '#10b981' : score >= 90 ? '#f59e0b' : '#ef4444'
  const status = score >= 97 ? 'Excellent' : score >= 90 ? 'Good' : 'Needs Attention'
  return (
    <div className="flex flex-col items-center">
      <svg width={200} height={116} viewBox="0 0 200 116" className="overflow-visible">
        {/* track */}
        <path d="M 20 100 A 80 80 0 0 0 180 100" fill="none" stroke="#e5e7eb" strokeWidth={18} strokeLinecap="butt" />
        {/* filled arc */}
        <path
          d="M 20 100 A 80 80 0 0 0 180 100"
          fill="none"
          stroke={color}
          strokeWidth={18}
          pathLength="100"
          strokeDasharray={`${score} 100`}
          strokeLinecap="butt"
        />
        {/* end caps at 0% and 100% */}
        <text x={13} y={114} textAnchor="middle" style={{ font: '10px sans-serif', fill: '#9ca3af' }}>0%</text>
        <text x={187} y={114} textAnchor="middle" style={{ font: '10px sans-serif', fill: '#9ca3af' }}>100%</text>
        {/* score */}
        <text x={100} y={74} textAnchor="middle" style={{ font: 'bold 28px sans-serif', fill: color }}>
          {score.toFixed(1)}%
        </text>
        <text x={100} y={93} textAnchor="middle" style={{ font: '11px sans-serif', fill: '#6b7280' }}>
          Global Health
        </text>
        <text x={100} y={110} textAnchor="middle" style={{ font: 'bold 11px sans-serif', fill: color }}>
          {status}
        </text>
      </svg>
    </div>
  )
}

// ── donut chart (pure SVG) ────────────────────────────────────────────────────

function DonutChart({ passed, failed }: { passed: number; failed: number }) {
  const total = passed + failed
  const r = 54, cx = 70, cy = 70, strokeW = 16
  const circ = 2 * Math.PI * r
  const failedArc = (failed / total) * circ
  const passedArc = (passed / total) * circ

  return (
    <svg width={140} height={140} className="block mx-auto">
      {/* track */}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f0fdf4" strokeWidth={strokeW} />
      {/* passed */}
      <circle
        cx={cx} cy={cy} r={r} fill="none"
        stroke="#10b981" strokeWidth={strokeW}
        strokeDasharray={`${passedArc} ${circ}`}
        strokeDashoffset={circ * 0.25} strokeLinecap="butt"
      />
      {/* failed */}
      <circle
        cx={cx} cy={cy} r={r} fill="none"
        stroke="#ef4444" strokeWidth={strokeW}
        strokeDasharray={`${failedArc} ${circ}`}
        strokeDashoffset={circ * 0.25 - passedArc} strokeLinecap="butt"
      />
      <text x={cx} y={cy - 8} textAnchor="middle" dominantBaseline="middle"
        className="text-lg font-bold" style={{ font: 'bold 18px sans-serif', fill: '#10b981' }}>
        {((passed / total) * 100).toFixed(1)}%
      </text>
      <text x={cx} y={cy + 12} textAnchor="middle" dominantBaseline="middle"
        style={{ font: '11px sans-serif', fill: '#6b7280' }}>
        pass rate
      </text>
    </svg>
  )
}

// ── rule tooltip ──────────────────────────────────────────────────────────────

function RuleTooltip({ text, children }: { text: string; children: React.ReactNode }) {
  const [show, setShow] = useState(false)
  return (
    <span
      className="relative inline-block cursor-help"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && (
        <span className="absolute z-50 left-0 top-full mt-1 w-64 bg-gray-900 text-white text-xs rounded-lg px-3 py-2 leading-relaxed shadow-xl pointer-events-none">
          {text}
          <span className="absolute -top-1.5 left-4 w-3 h-3 bg-gray-900 rotate-45" />
        </span>
      )}
    </span>
  )
}

// ── failed records panel ──────────────────────────────────────────────────────

function FailedDetail({ rule }: { rule: Rule }) {
  if (rule.failed === 0) {
    return (
      <tr>
        <td colSpan={8} className="px-6 pb-4 pt-2">
          <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-700 font-medium">
            ✓ No failures — all {rule.total.toLocaleString()} records passed this rule.
          </div>
        </td>
      </tr>
    )
  }
  const { columns, rows, issue } = rule.failedRows
  return (
    <tr>
      <td colSpan={8} className="px-6 pb-4 pt-1">
        <div className="rounded-lg border border-red-100 bg-red-50 p-3">
          <p className="text-xs font-semibold text-red-700 mb-2 uppercase tracking-wide">
            {rule.failed} failed record{rule.failed !== 1 ? 's' : ''} — example rows
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-red-200">
                  {columns.map(c => (
                    <th key={c} className={`pb-1.5 pr-4 font-semibold ${c === issue ? 'text-red-700' : 'text-gray-500'}`}>
                      {c === issue ? '⚠ ' : ''}{c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={i} className="border-b border-red-100 last:border-0">
                    {columns.map(c => {
                      const val = row[c]
                      const isBad = c === issue && (val === '' || val === 'NULL' || val === 'N/A' || val === 'NONE')
                      return (
                        <td key={c} className={`py-1.5 pr-4 font-mono ${isBad ? 'text-red-600 font-bold' : 'text-gray-700'}`}>
                          {isBad ? <span className="bg-red-100 px-1 rounded">{val === '' ? '(empty)' : String(val)}</span> : String(val)}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </td>
    </tr>
  )
}

// ── page ─────────────────────────────────────────────────────────────────────

export default function DataQuality() {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const totalFailed = RULES.reduce((sum, r) => sum + r.failed, 0)
  const totalPassed = RULES[0].total - totalFailed
  const score = ((totalPassed / RULES[0].total) * 100).toFixed(1)
  const totalChecks = RULES.reduce((sum, r) => sum + r.total, 0)
  const globalScore = ((totalChecks - totalFailed) / totalChecks * 100)

  const barData = RULES.map(r => ({
    name: r.id,
    passRate: parseFloat(((r.passed / r.total) * 100).toFixed(2)),
    severity: r.severity,
  }))

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Data Quality</h1>
        <p className="text-sm text-gray-500 mt-1">Validation rule results — current reporting cycle</p>
      </div>

      {/* context banner */}
      <div className="flex gap-3 rounded-xl border border-blue-200 bg-blue-50 px-5 py-4">
        <span className="mt-0.5 shrink-0 text-blue-500 text-lg">ⓘ</span>
        <p className="text-sm text-blue-800 leading-relaxed">
          <span className="font-semibold">About this tab: </span>
          This tab shows the output of automated validation rules that run after every data ingestion.
          In regulatory reporting environments, silent data errors are more dangerous than visible failures
          — this pipeline is designed to surface issues before they reach the report.
        </p>
      </div>

      {/* Global Health Score — management KPI */}
      <div className="rounded-xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-6">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <HealthGauge score={globalScore} />
          <div className="flex-1 space-y-3">
            <div>
              <h2 className="text-base font-bold text-gray-900">Global Health Score</h2>
              <p className="text-sm text-gray-500 mt-0.5 leading-relaxed">
                Management-level KPI: percentage of all validation checks passing this cycle across every active rule.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
              <div className="rounded-lg bg-white border border-gray-100 p-3">
                <p className="text-xs text-gray-400 mb-0.5">Total Checks</p>
                <p className="text-lg font-bold text-gray-800">{totalChecks.toLocaleString()}</p>
              </div>
              <div className="rounded-lg bg-white border border-red-100 p-3">
                <p className="text-xs text-red-400 mb-0.5">Failed</p>
                <p className="text-lg font-bold text-red-600">{totalFailed}</p>
              </div>
              <div className="rounded-lg bg-white border border-gray-100 p-3">
                <p className="text-xs text-gray-400 mb-0.5">Critical Rules</p>
                <p className="text-lg font-bold text-gray-800">{RULES.filter(r => r.severity === 'Critical').length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* top kpi + donut */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-stretch">
        {/* donut */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 flex flex-col items-center justify-center gap-3 sm:col-span-1">
          <DonutChart passed={totalPassed} failed={totalFailed} />
          <div className="flex gap-4 text-xs">
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />Passed ({totalPassed.toLocaleString()})</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" />Failed ({totalFailed})</span>
          </div>
        </div>
        {/* kpi cards */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 sm:col-span-1">
          <p className="text-sm text-gray-500">Quality Score</p>
          <p className="mt-1 text-3xl font-bold text-emerald-600">{score}%</p>
          <p className="mt-1 text-xs text-gray-400">Records passing all rules</p>
        </div>
        <div className="rounded-xl border border-red-100 bg-red-50 p-6 sm:col-span-1">
          <p className="text-sm text-red-600">Failed Records</p>
          <p className="mt-1 text-3xl font-bold text-red-700">{totalFailed}</p>
          <p className="mt-1 text-xs text-red-400">Across all active rules</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-6 sm:col-span-1">
          <p className="text-sm text-gray-500">Rules Evaluated</p>
          <p className="mt-1 text-3xl font-bold text-gray-900">{RULES.length}</p>
          <p className="mt-1 text-xs text-gray-400">Active validation rules</p>
        </div>
      </div>

      {/* pass rate bar chart */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="text-base font-semibold text-gray-800 mb-1">Pass Rate by Rule</h2>
        <p className="text-xs text-gray-400 mb-4">Color = severity: <span className="text-red-500 font-semibold">Critical</span> · <span className="text-orange-500 font-semibold">High</span> · <span className="text-yellow-500 font-semibold">Medium</span> · <span className="text-blue-500 font-semibold">Low</span></p>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={barData} layout="vertical" margin={{ left: 8, right: 32, top: 4, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
            <XAxis type="number" domain={[98, 100.5]} tick={{ fontSize: 11 }} unit="%" />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={52} />
            <RechartsTooltip
              formatter={(v: number) => [`${v.toFixed(2)}%`, 'Pass rate']}
              contentStyle={{ fontSize: 12, borderRadius: 8 }}
            />
            <Bar dataKey="passRate" radius={[0, 4, 4, 0]} maxBarSize={22}>
              {barData.map((entry, i) => (
                <Cell key={i} fill={SEV_BAR[entry.severity]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* rules table — scrollable on mobile */}
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 font-semibold text-gray-600">Rule ID</th>
              <th className="px-4 py-3 font-semibold text-gray-600">Rule Name</th>
              <th className="px-4 py-3 font-semibold text-gray-600">Severity</th>
              <th className="px-4 py-3 font-semibold text-gray-600">Reg. Impact</th>
              <th className="px-4 py-3 font-semibold text-gray-600 text-right">Passed</th>
              <th className="px-4 py-3 font-semibold text-gray-600 text-right">Failed</th>
              <th className="px-4 py-3 font-semibold text-gray-600 text-right">Pass Rate</th>
              <th className="px-4 py-3 w-8" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {RULES.map(rule => {
              const isOpen = expandedId === rule.id
              const hasFailures = rule.failed > 0
              return (
                <>
                  <tr
                    key={rule.id}
                    className={`transition-colors ${hasFailures ? 'hover:bg-gray-50 cursor-pointer' : ''}`}
                    onClick={() => hasFailures && setExpandedId(isOpen ? null : rule.id)}
                  >
                    <td className="px-4 py-3 font-mono text-gray-500">{rule.id}</td>
                    <td className="px-4 py-3 font-medium text-gray-800">
                      <RuleTooltip text={rule.tooltip}>
                        <span className="border-b border-dashed border-gray-400">{rule.name}</span>
                        <span className="ml-1 text-gray-400 text-xs">ⓘ</span>
                      </RuleTooltip>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${SEV_BADGE[rule.severity]}`}>
                        {rule.severity}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${
                        rule.regulatoryImpact === 'High' ? 'bg-red-100 text-red-700'
                        : rule.regulatoryImpact === 'Medium' ? 'bg-amber-100 text-amber-700'
                        : 'bg-slate-100 text-slate-600'
                      }`}>
                        {rule.regulatoryImpact}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-gray-600">{rule.passed.toLocaleString()}</td>
                    <td className={`px-4 py-3 text-right font-semibold ${rule.failed > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                      {rule.failed}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-gray-900">
                      {((rule.passed / rule.total) * 100).toFixed(1)}%
                    </td>
                    <td className="px-4 py-3 text-center select-none">
                      {hasFailures && (
                        <span className={`inline-block transition-transform duration-200 text-gray-400 text-xs ${isOpen ? 'rotate-180' : ''}`}>▼</span>
                      )}
                    </td>
                  </tr>
                  {isOpen && hasFailures && <FailedDetail key={`${rule.id}-detail`} rule={rule} />}
                </>
              )
            })}
          </tbody>
        </table>
        </div>{/* end overflow-x-auto */}
      </div>
    </div>
  )
}
