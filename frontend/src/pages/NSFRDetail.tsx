import { useState, useEffect } from 'react'
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine,
} from 'recharts'
import { fetchNsfr, type NsfrResponse, dateToQuarter } from '../api'

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
  const [data, setData] = useState<NsfrResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchNsfr().then(setData).catch((e: Error) => setError(e.message))
  }, [])

  // API returns newest-first; reverse for chrono charts
  const chronological = data ? [...data.banks].reverse() : []
  const latest = data?.banks[0] ?? null

  // Data for NSFR ratio trend
  const ratioTrend = chronological.map(b => ({
    quarter: b.reference_date ? dateToQuarter(b.reference_date) : '',
    nsfr_ratio: b.nsfr_ratio,
  }))

  // Data for ASF vs RSF grouped bars (last 12 quarters)
  const fundingData = chronological.slice(-12).map(b => ({
    quarter: b.reference_date ? dateToQuarter(b.reference_date) : '',
    asf: b.asf_amount,
    rsf: b.rsf_amount,
  }))

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">NSFR Detail</h1>
        <p className="text-sm text-gray-500 mt-1">Net Stable Funding Ratio — EU Banking Sector (ECB Aggregate, quarterly)</p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <span className="font-semibold">⚠ Could not load data:</span> {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="NSFR Ratio"
          value={latest?.nsfr_ratio != null ? `${latest.nsfr_ratio.toFixed(1)}%` : '—'}
          sub={`Latest: ${latest?.reference_date ? dateToQuarter(latest.reference_date) : '…'} | Min required: 100%`}
        />
        <StatCard
          label="Available Stable Funding (ASF)"
          value={latest?.asf_amount != null ? latest.asf_amount.toFixed(1) : '—'}
          sub="ECB published index value"
        />
        <StatCard
          label="Required Stable Funding (RSF)"
          value={latest?.rsf_amount != null ? latest.rsf_amount.toFixed(1) : '—'}
          sub="ECB published index value"
        />
      </div>

      {/* NSFR ratio trend */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="text-base font-semibold text-gray-800 mb-4">NSFR Ratio — Quarterly Trend</h2>
        {ratioTrend.length > 0 ? (
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={ratioTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="quarter" tick={{ fontSize: 10 }} interval={2} />
              <YAxis domain={['auto', 'auto']} tick={{ fontSize: 12 }} unit="%" />
              <Tooltip formatter={(v: number) => [`${v.toFixed(1)}%`, 'NSFR']} />
              <ReferenceLine y={100} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: '100% min', position: 'insideTopRight', fontSize: 10 }} />
              <Line type="monotone" dataKey="nsfr_ratio" stroke="#6366f1" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-sm text-gray-400 text-center py-10">{data ? 'No data available.' : 'Loading…'}</p>
        )}
      </div>

      {/* ASF vs RSF by quarter */}
      {fundingData.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="text-base font-semibold text-gray-800 mb-4">ASF vs RSF — Last 12 Quarters</h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={fundingData} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="quarter" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="asf" name="Available Stable Funding" fill="#6366f1" radius={[4, 4, 0, 0]} />
              <Bar dataKey="rsf" name="Required Stable Funding" fill="#e0e7ff" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <p className="mt-2 text-xs text-gray-400">Source: ECB Supervisory Banking Statistics. Values are ECB published indices.</p>
        </div>
      )}

      {/* Data table */}
      {chronological.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 overflow-x-auto">
          <h2 className="text-base font-semibold text-gray-800 mb-4">All Quarterly Observations</h2>
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="pb-2 font-semibold text-gray-600">Quarter</th>
                <th className="pb-2 font-semibold text-gray-600 text-right">ASF</th>
                <th className="pb-2 font-semibold text-gray-600 text-right">RSF</th>
                <th className="pb-2 font-semibold text-gray-600 text-right">NSFR Ratio</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {[...chronological].reverse().map(b => (
                <tr key={b.reference_date}>
                  <td className="py-2 text-gray-700">{b.reference_date ? dateToQuarter(b.reference_date) : '—'}</td>
                  <td className="py-2 text-gray-500 text-right">{b.asf_amount?.toFixed(1) ?? '—'}</td>
                  <td className="py-2 text-gray-500 text-right">{b.rsf_amount?.toFixed(1) ?? '—'}</td>
                  <td className={`py-2 font-semibold text-right ${b.nsfr_ratio != null && b.nsfr_ratio >= 100 ? 'text-indigo-700' : 'text-red-600'}`}>
                    {b.nsfr_ratio?.toFixed(1) ?? '—'}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
