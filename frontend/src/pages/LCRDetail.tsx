import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts'

const inflowData = [
  { category: 'Secured lending', amount: 42 },
  { category: 'Unsecured wholesale', amount: 18 },
  { category: 'Retail deposits', amount: 31 },
  { category: 'Derivatives', amount: 9 },
]
const outflowData = [
  { category: 'Retail run-off', amount: 28 },
  { category: 'Wholesale funding', amount: 45 },
  { category: 'Committed facilities', amount: 12 },
  { category: 'Derivative outflows', amount: 7 },
]
const hqlaData = [
  { name: 'L1 — Govt bonds', value: 310, fill: '#10b981' },
  { name: 'L2A — Agency', value: 85, fill: '#34d399' },
  { name: 'L2B — Corp bonds', value: 40, fill: '#6ee7b7' },
]

export default function LCRDetail() {
  const totalHQLA = hqlaData.reduce((s, d) => s + d.value, 0)
  const netOutflow = outflowData.reduce((s, d) => s + d.amount, 0) - inflowData.reduce((s, d) => s + d.amount, 0) * 0.75
  const lcr = ((totalHQLA / netOutflow) * 100).toFixed(1)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">LCR Detail</h1>
        <p className="text-sm text-gray-500 mt-1">Liquidity Coverage Ratio — 30-day stress horizon</p>
      </div>

      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Total HQLA</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">€{totalHQLA}M</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Net Cash Outflow (30d)</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">€{netOutflow.toFixed(0)}M</p>
        </div>
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <p className="text-xs text-emerald-700 uppercase tracking-wide font-semibold">LCR Ratio</p>
          <p className="text-3xl font-bold text-emerald-700 mt-1">{lcr}%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="text-base font-semibold text-gray-800 mb-4">Cash Inflows by Category</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={inflowData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" tick={{ fontSize: 11 }} unit="M" />
              <YAxis type="category" dataKey="category" tick={{ fontSize: 11 }} width={130} />
              <Tooltip formatter={(v: number) => [`€${v}M`, 'Inflow']} />
              <Bar dataKey="amount" fill="#10b981" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="text-base font-semibold text-gray-800 mb-4">Cash Outflows by Category</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={outflowData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" tick={{ fontSize: 11 }} unit="M" />
              <YAxis type="category" dataKey="category" tick={{ fontSize: 11 }} width={130} />
              <Tooltip formatter={(v: number) => [`€${v}M`, 'Outflow']} />
              <Bar dataKey="amount" fill="#f43f5e" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="text-base font-semibold text-gray-800 mb-4">HQLA Composition</h2>
        <div className="space-y-3">
          {hqlaData.map((d) => (
            <div key={d.name} className="flex items-center gap-4">
              <span className="w-40 text-sm text-gray-600 shrink-0">{d.name}</span>
              <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${(d.value / totalHQLA) * 100}%`, backgroundColor: d.fill }} />
              </div>
              <span className="text-sm font-semibold text-gray-800 w-16 text-right">€{d.value}M</span>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-gray-400">L1 assets carry 100% weight. L2A: 85%. L2B: 75% — per Basel III CRR2.</p>
      </div>
    </div>
  )
}
