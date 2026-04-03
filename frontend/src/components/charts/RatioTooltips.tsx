export function LcrTooltip({ active, payload, label }: {
  active?: boolean
  payload?: { value: number }[]
  label?: string
}) {
  if (!active || !payload?.length) return null
  const v = payload[0].value
  const interpretation =
    v >= 150 ? 'Well above minimum — strong liquidity buffer.'
    : v >= 120 ? 'Comfortably compliant with Basel III minimum.'
    : v >= 100 ? 'Compliant but approaching the 100% regulatory floor.'
    : 'BREACH — below the 100% minimum requirement.'
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-xs max-w-[200px]">
      <p className="font-semibold text-gray-700 mb-1">{label}</p>
      <p className="text-lg font-bold text-emerald-700">{v.toFixed(1)}%</p>
      <p className="text-gray-500 mt-1 leading-snug">{interpretation}</p>
    </div>
  )
}

export function NsfrTooltip({ active, payload, label }: {
  active?: boolean
  payload?: { value: number }[]
  label?: string
}) {
  if (!active || !payload?.length) return null
  const v = payload[0].value
  const interpretation =
    v >= 130 ? 'Very strong long-term funding structure.'
    : v >= 115 ? 'Comfortable buffer above the 100% minimum.'
    : v >= 100 ? 'Compliant — limited headroom above the floor.'
    : 'BREACH — stable funding deficit.'
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-xs max-w-[200px]">
      <p className="font-semibold text-gray-700 mb-1">{label}</p>
      <p className="text-lg font-bold text-indigo-700">{v.toFixed(1)}%</p>
      <p className="text-gray-500 mt-1 leading-snug">{interpretation}</p>
    </div>
  )
}
