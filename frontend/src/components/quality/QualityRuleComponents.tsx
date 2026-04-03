import { useState } from 'react'
import type { Rule } from './qualityData'

export function RuleTooltip({ text, children }: { text: string; children: React.ReactNode }) {
  const [show, setShow] = useState(false)
  return (
    <span className="relative inline-block cursor-help"
      onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
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

export function FailedDetail({ rule }: { rule: Rule }) {
  if (rule.failed === 0) {
    return (
      <tr>
        <td colSpan={8} className="px-6 pb-4 pt-2">
          <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-700 font-medium">
            No failures — all {rule.total.toLocaleString()} records passed this rule.
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
                      {c}
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
                          {isBad
                            ? <span className="bg-red-100 px-1 rounded">{val === '' ? '(empty)' : String(val)}</span>
                            : String(val)}
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
