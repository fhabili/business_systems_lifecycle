import { useState, useEffect, useMemo } from 'react'
import { TrendingUp } from 'lucide-react'
import { fetchSummary, type SummaryResponse, fetchNsfr, type NsfrResponse } from '../api'
import { ProFormaSimulator } from '../components/simulator/ProFormaSimulator'
import { StressTestPanel } from '../components/simulator/StressTestPanel'
import { ExecutiveLcrChart } from '../components/charts/ExecutiveLcrChart'
import { GLOBAL_QUALITY_SCORE } from '../components/quality/qualityData'

export default function ExecutiveSummary() {
  const [data, setData]         = useState<SummaryResponse | null>(null)
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState<string | null>(null)
  const [nsfrData, setNsfrData] = useState<NsfrResponse | null>(null)
  const [shock, setShock]       = useState(0)
  const [showBrush, setShowBrush] = useState(
    typeof window !== 'undefined' && window.innerWidth >= 768
  )

  function load() {
    setLoading(true)
    setError(null)
    fetchSummary()
      .then(setData)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  useEffect(() => {
    fetchNsfr().then(setNsfrData).catch(() => {})
  }, [])

  useEffect(() => {
    const onResize = () => setShowBrush(window.innerWidth >= 768)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const lcr  = data?.lcr_ratio  ?? null
  const nsfr = data?.nsfr_ratio ?? null
  const stressedLcr  = lcr  != null ? lcr  * (1 - shock / 100) : null
  const stressedNsfr = nsfr != null ? nsfr * (1 - shock / 100) : null

  const avgLcr = data?.lcr_trend?.length
    ? data.lcr_trend.reduce((s, p) => s + p.lcr_ratio, 0) / data.lcr_trend.length
    : null
  const nsfrAvg = useMemo(() => {
    const valid = (nsfrData?.banks ?? []).filter(b => b.nsfr_ratio != null && b.nsfr_ratio > 0)
    return valid.length > 0
      ? (valid.reduce((s, b) => s + b.nsfr_ratio!, 0) / valid.length).toFixed(1)
      : '—'
  }, [nsfrData])
  // Fall back to the static GLOBAL_QUALITY_SCORE (computed from qualityData RULES) when
  // the backend validation pipeline has not yet populated data_quality_score in the DB.
  const dqScore = data?.data_quality_score ?? (data ? GLOBAL_QUALITY_SCORE : null)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold" style={{ color: '#1B2A4A' }}>Executive Terminal</h1>
        <p className="text-sm text-slate-500 mt-1">Regulatory Analytics — Multi-year trend analysis (LCR: 2016–2025 | NSFR: 2021–2025)</p>
      </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 flex items-center justify-between gap-4">
            <span><span className="font-semibold">Could not load data:</span> {error}</span>
            <button onClick={load} className="shrink-0 px-3 py-1.5 rounded-lg bg-red-100 hover:bg-red-200 text-red-800 text-xs font-semibold transition-colors">
              Retry
            </button>
          </div>
        )}

        {/* at-a-glance summary stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-lg bg-white border border-gray-200 pl-5 pr-4 py-4"
            style={{ borderLeftWidth: '4px', borderLeftColor: '#10B981' }}>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Avg LCR — Period</p>
            <p className="text-3xl font-bold font-mono flex items-center gap-2" style={{ color: '#1B2A4A' }}>
              {loading ? (
                <span className="text-lg font-normal text-gray-400 animate-pulse">Calculating…</span>
              ) : (
                <>{avgLcr != null ? avgLcr.toFixed(1) : '—'}<span className="text-lg font-normal text-gray-400">%</span></>
              )}
              {!loading && <TrendingUp className="w-5 h-5 shrink-0" style={{ color: '#10B981' }} />}
            </p>
            <p className="text-xs font-medium mt-1.5" style={{ color: '#10B981' }}>All-periods average (from trend)</p>
          </div>
          <div className="rounded-lg bg-white border border-gray-200 pl-5 pr-4 py-4"
            style={{ borderLeftWidth: '4px', borderLeftColor: '#10B981' }}>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Avg NSFR — Period</p>
            <p className="text-3xl font-bold font-mono" style={{ color: '#1B2A4A' }}>
              {loading ? (
                <span className="text-lg font-normal text-gray-400 animate-pulse">Calculating…</span>
              ) : (
                <>{nsfrAvg}<span className="text-lg font-normal text-gray-400">%</span></>
              )}
            </p>
            <p className="text-xs font-medium mt-1.5" style={{ color: '#10B981' }}>All-periods average (from trend)</p>
          </div>
          <div className="rounded-lg bg-white border border-gray-200 pl-5 pr-4 py-4"
            style={{ borderLeftWidth: '4px', borderLeftColor: '#10B981' }}>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">System Health</p>
            <p className="text-3xl font-bold font-mono" style={{ color: '#1B2A4A' }}>
              {loading ? (
                <span className="text-lg font-normal text-gray-400 animate-pulse">Calculating…</span>
              ) : (
                <>{dqScore != null ? dqScore.toFixed(1) : '—'}<span className="text-lg font-normal text-gray-400">%</span></>
              )}
            </p>
            <p className="text-xs font-medium mt-1.5" style={{ color: '#10B981' }}>Records passing all rules</p>
          </div>
        </div>

        <StressTestPanel
          shock={shock}
          onShockChange={setShock}
          stressedLcr={stressedLcr}
          stressedNsfr={stressedNsfr}
        />

        {data && data.active_alerts.length > 0 && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 space-y-1">
            <p className="font-semibold">Active Alerts ({data.active_alerts.length})</p>
            {data.active_alerts.map((a, i) => <p key={i}>{a}</p>)}
          </div>
        )}

        {/* LCR trend + simulator */}
        <div className="flex flex-col gap-6">
          <div className="rounded-xl border border-gray-200 bg-white p-6 flex flex-col">
            <h2 className="text-base font-semibold text-gray-800 mb-4">LCR Trend — EU Banking Sector (ECB Aggregate)</h2>
            <div className="flex-1">
              {data && data.lcr_trend.length > 0
                ? <ExecutiveLcrChart data={data.lcr_trend} showBrush={showBrush} />
                : <p className="text-sm text-gray-400 text-center py-10">{data ? 'No trend data available.' : 'Loading…'}</p>
              }
            </div>
            <p className="mt-2 text-xs text-gray-400">Source: ECB Supervisory Banking Statistics | Dashed line = 100% regulatory minimum</p>
          </div>
          <div>
            <ProFormaSimulator />
          </div>
        </div>
    </div>
  )
}
