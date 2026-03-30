import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const fundingData = [
  { bucket: '< 6 months', asf: 120, rsf: 95 },
  { bucket: '6–12 months', asf: 85, rsf: 78 },
  { bucket: '1–2 years', asf: 60, rsf: 55 },
  { bucket: '> 2 years', asf: 210, rsf: 180 },
]

function StatCard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-1 text-3xl font-bold text-gray-900">{value}</p>
      <p className="mt-1 text-xs text-gray-400">{sub}</p>
    </div>
  )
}

export default function NSFRDetail() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">NSFR Detail</h1>
        <p className="text-sm text-gray-500 mt-1">Net Stable Funding Ratio — Available vs Required Stable Funding</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="NSFR Ratio" value="108%" sub="Minimum required: 100%" />
        <StatCard label="Available Stable Funding (ASF)" value="€475M" sub="Weighted liabilities + equity" />
        <StatCard label="Required Stable Funding (RSF)" value="€440M" sub="Weighted assets by liquidity" />
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="text-base font-semibold text-gray-800 mb-4">ASF vs RSF by Maturity Bucket</h2>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={fundingData} barCategoryGap="30%">
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="bucket" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} unit="M" />
            <Tooltip formatter={(v: number) => [`€${v}M`]} />
            <Legend />
            <Bar dataKey="asf" name="Available Stable Funding" fill="#6366f1" radius={[4, 4, 0, 0]} />
            <Bar dataKey="rsf" name="Required Stable Funding" fill="#e0e7ff" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="text-base font-semibold text-gray-800 mb-3">Instrument Breakdown</h2>
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="pb-2 font-semibold text-gray-600">Instrument Type</th>
              <th className="pb-2 font-semibold text-gray-600 text-right">ASF Factor</th>
              <th className="pb-2 font-semibold text-gray-600 text-right">Weighted ASF</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {[
              { type: 'Tier 1 Capital', factor: '100%', weighted: '€180M' },
              { type: 'Stable retail deposits (>1yr)', factor: '95%', weighted: '€114M' },
              { type: 'Less stable retail deposits', factor: '90%', weighted: '€99M' },
              { type: 'Wholesale funding (>1yr)', factor: '50%', weighted: '€82M' },
            ].map(row => (
              <tr key={row.type}>
                <td className="py-2 text-gray-700">{row.type}</td>
                <td className="py-2 text-gray-500 text-right">{row.factor}</td>
                <td className="py-2 font-medium text-gray-900 text-right">{row.weighted}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
