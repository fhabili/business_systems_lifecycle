interface StressTestProps {
  shock: number
  onShockChange: (v: number) => void
  stressedLcr: number | null
  stressedNsfr: number | null
}

export function StressTestPanel({ shock, onShockChange, stressedLcr, stressedNsfr }: StressTestProps) {
  const lcrBreached  = stressedLcr  != null && stressedLcr  < 100
  const nsfrBreached = stressedNsfr != null && stressedNsfr < 100
  const anyBreach    = lcrBreached || nsfrBreached

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-base font-semibold text-gray-800">Stress Test Simulator</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Apply a hypothetical funding shock and see the impact on both LCR and NSFR
          </p>
        </div>
        <span className={`text-sm font-bold px-3 py-1 rounded-full ${
          anyBreach ? 'bg-red-100 text-red-700'
          : shock > 0 ? 'bg-emerald-100 text-emerald-700'
          : 'bg-gray-100 text-gray-400'
        }`}>
          {shock === 0 ? '—' : anyBreach ? 'Breach' : 'Compliant'}
        </span>
      </div>

      <div className="flex items-center gap-4">
        <span className="text-xs text-gray-500 w-20 shrink-0">Shock: {shock}%</span>
        <input
          type="range" min={0} max={60} step={1} value={shock}
          onChange={e => onShockChange(Number(e.target.value))}
          className="flex-1 accent-emerald-600"
        />
        <span className="text-xs text-gray-500 w-24 shrink-0 text-right">
          {shock > 0 ? `−${shock}% applied` : 'No shock'}
        </span>
      </div>

      {shock > 0 && stressedLcr != null && stressedNsfr != null && (
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className={`rounded-lg p-3 text-xs ${lcrBreached ? 'bg-red-50 border border-red-200' : 'bg-emerald-50 border border-emerald-200'}`}>
            <p className="font-semibold text-gray-600 mb-1">LCR after shock</p>
            <p className={`text-xl font-bold ${lcrBreached ? 'text-red-600' : 'text-emerald-700'}`}>
              {stressedLcr.toFixed(1)}%
            </p>
            <p className={`mt-1 ${lcrBreached ? 'text-red-500' : 'text-emerald-600'}`}>
              {lcrBreached
                ? `Breach by ${(100 - stressedLcr).toFixed(1)}pp`
                : `${(stressedLcr - 100).toFixed(1)}pp headroom`}
            </p>
          </div>
          <div className={`rounded-lg p-3 text-xs ${nsfrBreached ? 'bg-red-50 border border-red-200' : 'bg-emerald-50 border border-emerald-200'}`}>
            <p className="font-semibold text-gray-600 mb-1">NSFR after shock</p>
            <p className={`text-xl font-bold ${nsfrBreached ? 'text-red-600' : 'text-emerald-700'}`}>
              {stressedNsfr.toFixed(1)}%
            </p>
            <p className={`mt-1 ${nsfrBreached ? 'text-red-500' : 'text-emerald-600'}`}>
              {nsfrBreached
                ? `Breach by ${(100 - stressedNsfr).toFixed(1)}pp`
                : `${(stressedNsfr - 100).toFixed(1)}pp headroom`}
            </p>
          </div>
        </div>
      )}

      {shock === 0 && (
        <p className="mt-3 text-xs text-gray-400">
          Move the slider to apply a stress scenario to both LCR and NSFR simultaneously.
        </p>
      )}
    </div>
  )
}
