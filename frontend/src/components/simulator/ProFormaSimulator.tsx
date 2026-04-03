import { useState } from 'react'

const BASE_HQLA     = 5_112_700
const BASE_OUTFLOWS = 3_223_600
const BASE_LCR      = parseFloat((BASE_HQLA / BASE_OUTFLOWS * 100).toFixed(1))

type AccountType =
  | 'Cash & Central Bank Reserves'
  | 'Level 1 Govt Bonds'
  | 'Retail Deposits'
  | 'Wholesale Funding'

const ACCOUNT_TYPES: AccountType[] = [
  'Cash & Central Bank Reserves',
  'Level 1 Govt Bonds',
  'Retail Deposits',
  'Wholesale Funding',
]

interface SimResult {
  proFormaLcr: number
  delta: number
  newHqla: number
  newOutflows: number
}

export function ProFormaSimulator() {
  const [accountType, setAccountType] = useState<AccountType>('Cash & Central Bank Reserves')
  const [amount, setAmount]           = useState('')
  const [result, setResult]           = useState<SimResult | null>(null)
  const [showTip, setShowTip]         = useState(false)
  const [calculating, setCalculating] = useState(false)

  function calculate() {
    const eur = parseFloat(amount)
    if (isNaN(eur) || eur <= 0) return
    setCalculating(true)
    setResult(null)
    setTimeout(() => {
      let newHqla     = BASE_HQLA
      let newOutflows = BASE_OUTFLOWS
      if (accountType === 'Cash & Central Bank Reserves' || accountType === 'Level 1 Govt Bonds') {
        newHqla = BASE_HQLA + eur
      } else if (accountType === 'Retail Deposits') {
        newOutflows = BASE_OUTFLOWS + eur * 0.05
      } else if (accountType === 'Wholesale Funding') {
        newOutflows = BASE_OUTFLOWS + eur * 1.00
      }
      const proFormaLcr = parseFloat((newHqla / newOutflows * 100).toFixed(2))
      const delta       = parseFloat((proFormaLcr - BASE_LCR).toFixed(2))
      setResult({ proFormaLcr, delta, newHqla, newOutflows })
      setCalculating(false)
    }, 1000)
  }

  const isHqlaType = accountType === 'Cash & Central Bank Reserves' || accountType === 'Level 1 Govt Bonds'
  const weight     = accountType === 'Retail Deposits' ? '5%' : accountType === 'Wholesale Funding' ? '100%' : '—'

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-5 h-full flex flex-col">
      <div className="space-y-5 flex-1 flex flex-col">
      <div>
        <h2 className="text-base font-semibold text-gray-900">Strategic Pro-Forma Simulator</h2>
        <p className="text-xs text-gray-400 mt-0.5">
          Model the LCR impact of a transaction before execution — frontend-only, no data is sent.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        {/* account type */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Account Type</label>
          <select
            value={accountType}
            onChange={e => { setAccountType(e.target.value as AccountType); setResult(null) }}
            className="h-12 text-sm font-mono border border-gray-200 rounded-lg px-3 pr-8 overflow-hidden focus:outline-none focus:ring-2 focus:ring-gray-300 bg-white tracking-tight truncate"
          >
            {ACCOUNT_TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>

        {/* amount */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Amount (EUR Millions)</label>
          <input
            type="number"
            min={0}
            placeholder="e.g. 50000"
            value={amount}
            onChange={e => { setAmount(e.target.value); setResult(null) }}
            onKeyDown={e => { if (e.key === 'Enter') calculate() }}
            className="h-12 text-sm font-mono border border-gray-200 rounded-lg px-3 focus:outline-none focus:ring-2 focus:ring-gray-300 tabular-nums tracking-tight"
          />
        </div>

        {/* button */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide opacity-0 select-none">Action</label>
          <div className="relative inline-block">
            <button
              onClick={calculate}
              disabled={!amount || parseFloat(amount) <= 0 || calculating}
              className="w-full h-12 disabled:opacity-40 text-white text-sm font-semibold px-4 rounded-lg transition-all flex items-center justify-center gap-2"
              style={{ backgroundColor: '#1B2A4A' }}
              onMouseEnter={e => { (e.currentTarget.style.filter = 'brightness(1.15)'); setShowTip(true) }}
              onMouseLeave={e => { (e.currentTarget.style.filter = ''); setShowTip(false) }}
            >
              {calculating ? (
                <>
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Calculating…
                </>
              ) : 'Calculate Impact'}
            </button>
            {showTip && (
              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-72 bg-gray-900 text-white text-xs rounded-lg px-3 py-2 leading-relaxed shadow-xl z-50 pointer-events-none">
                Applies CRR Article 416/422 run-off weights to simulate pre-trade liquidity impact.
                <span className="absolute top-full left-1/2 -translate-x-1/2 w-3 h-3 bg-gray-900 rotate-45 -mt-1.5" />
              </div>
            )}
          </div>
        </div>
      </div>
      <p className="text-xs text-gray-400 -mt-3">
        {isHqlaType ? 'Run-off weight: 0% (Level 1 HQLA — no haircut)' : `CRR run-off weight: ${weight}`}
      </p>

      {/* regulatory alert */}
      {result && result.proFormaLcr < 100 && (
        <div className="flex gap-3 rounded-xl border border-red-300 bg-red-50 px-5 py-4">
          <div>
            <p className="text-sm font-bold text-red-800 mb-0.5">Regulatory Alert</p>
            <p className="text-sm text-red-700 leading-relaxed">
              Warning: Transaction would result in a Liquidity Coverage Ratio breach.
              Under CRR Article 412, institutions must maintain an LCR ≥ 100% at all times.
              This transaction cannot proceed without a compensating liquidity action.
            </p>
          </div>
        </div>
      )}

      {/* result */}
      {result && (
        <div className={`rounded-xl border p-4 ${result.proFormaLcr >= 100 ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-500">Current LCR:</span>
              <span className="font-bold text-gray-800">{BASE_LCR.toFixed(1)}%</span>
            </div>
            <span className="text-gray-300">→</span>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-500">Pro-Forma LCR:</span>
              <span className={`text-xl font-bold ${result.proFormaLcr >= 100 ? 'text-emerald-700' : 'text-red-600'}`}>
                {result.proFormaLcr.toFixed(2)}%
              </span>
            </div>
            <span className={`inline-flex items-center text-xs font-bold px-2.5 py-0.5 rounded-full ${result.delta >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
              {result.delta >= 0 ? '+' : ''}{result.delta.toFixed(2)}pp
            </span>
            {result.proFormaLcr < 100 && (
              <span className="text-xs font-bold text-red-600">Breach — below 100% floor</span>
            )}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            {([
              ['Base HQLA', BASE_HQLA.toLocaleString()],
              ['Pro-Forma HQLA', result.newHqla.toLocaleString()],
              ['Base Outflows', BASE_OUTFLOWS.toLocaleString()],
              ['Pro-Forma Outflows', result.newOutflows.toLocaleString()],
            ] as [string, string][]).map(([label, val]) => (
              <div key={label} className="bg-white bg-opacity-70 rounded-lg p-2.5">
                <p className="text-gray-500 mb-0.5">{label}</p>
                <p className="font-mono font-semibold text-gray-700">{val} M</p>
              </div>
            ))}
          </div>
        </div>
      )}

      </div>
    </div>
  )
}
