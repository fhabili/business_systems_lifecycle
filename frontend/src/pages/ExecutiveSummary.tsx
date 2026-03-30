import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const mockLcrTrend = [
  { date: 'Jan', lcr: 118 },
  { date: 'Feb', lcr: 124 },
  { date: 'Mar', lcr: 131 },
  { date: 'Apr', lcr: 127 },
  { date: 'May', lcr: 135 },
  { date: 'Jun', lcr: 142 },
]

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

export default function ExecutiveSummary() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Executive Summary</h1>
        <p className="text-sm text-gray-500 mt-1">Regulatory snapshot — as of today</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard label="Liquidity Coverage Ratio (LCR)" value="142%" unit="min 100%" status="pass" />
        <MetricCard label="Net Stable Funding Ratio (NSFR)" value="108%" unit="min 100%" status="pass" />
        <MetricCard label="Data Quality Score" value="96.4%" unit="records passing" status="pass" />
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="text-base font-semibold text-gray-800 mb-4">LCR Trend — Rolling 6 months</h2>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={mockLcrTrend}>
            <defs>
              <linearGradient id="lcrFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis domain={[80, 160]} tick={{ fontSize: 12 }} unit="%" />
            <Tooltip formatter={(v: number) => [`${v}%`, 'LCR']} />
            <Area type="monotone" dataKey="lcr" stroke="#10b981" fill="url(#lcrFill)" strokeWidth={2} dot />
          </AreaChart>
        </ResponsiveContainer>
        <p className="mt-2 text-xs text-gray-400">Regulatory minimum: 100% | Dashed line = threshold</p>
      </div>

      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        <span className="font-semibold">⚠ Active Alert:</span> 3 positions missing counterparty LEI — see Data Quality tab for details.
      </div>
    </div>
  )
}
