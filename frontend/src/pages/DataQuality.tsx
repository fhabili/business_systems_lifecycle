const rules = [
  { id: 'DQ-001', name: 'Missing Counterparty LEI', severity: 'Critical', passed: 847, failed: 3, total: 850 },
  { id: 'DQ-002', name: 'Negative Liquidity Buffer', severity: 'Critical', passed: 850, failed: 0, total: 850 },
  { id: 'DQ-003', name: 'LCR Ratio Out of Tolerance (>5% MoM swing)', severity: 'High', passed: 849, failed: 1, total: 850 },
  { id: 'DQ-004', name: 'Missing Maturity Date on Flow', severity: 'Medium', passed: 843, failed: 7, total: 850 },
  { id: 'DQ-005', name: 'Collateral Value Below Threshold', severity: 'Medium', passed: 850, failed: 0, total: 850 },
  { id: 'DQ-006', name: 'Currency Mismatch on Settlement', severity: 'Low', passed: 848, failed: 2, total: 850 },
]

const severityStyle: Record<string, string> = {
  Critical: 'bg-red-100 text-red-700',
  High: 'bg-amber-100 text-amber-700',
  Medium: 'bg-yellow-100 text-yellow-700',
  Low: 'bg-blue-100 text-blue-700',
}

export default function DataQuality() {
  const totalFailed = rules.reduce((sum, r) => sum + r.failed, 0)
  const totalRecords = rules[0].total
  const score = (((totalRecords - totalFailed) / totalRecords) * 100).toFixed(1)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Data Quality</h1>
        <p className="text-sm text-gray-500 mt-1">Validation rule results — current reporting cycle</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <p className="text-sm text-gray-500">Overall Quality Score</p>
          <p className="mt-1 text-3xl font-bold text-emerald-600">{score}%</p>
          <p className="mt-1 text-xs text-gray-400">Records passing all rules</p>
        </div>
        <div className="rounded-xl border border-red-100 bg-red-50 p-6">
          <p className="text-sm text-red-600">Total Failed Records</p>
          <p className="mt-1 text-3xl font-bold text-red-700">{totalFailed}</p>
          <p className="mt-1 text-xs text-red-400">Across all active rules</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <p className="text-sm text-gray-500">Rules Evaluated</p>
          <p className="mt-1 text-3xl font-bold text-gray-900">{rules.length}</p>
          <p className="mt-1 text-xs text-gray-400">Active validation rules</p>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 font-semibold text-gray-600">Rule ID</th>
              <th className="px-4 py-3 font-semibold text-gray-600">Rule Name</th>
              <th className="px-4 py-3 font-semibold text-gray-600">Severity</th>
              <th className="px-4 py-3 font-semibold text-gray-600 text-right">Passed</th>
              <th className="px-4 py-3 font-semibold text-gray-600 text-right">Failed</th>
              <th className="px-4 py-3 font-semibold text-gray-600 text-right">Pass Rate</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rules.map(rule => (
              <tr key={rule.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 font-mono text-gray-500">{rule.id}</td>
                <td className="px-4 py-3 font-medium text-gray-800">{rule.name}</td>
                <td className="px-4 py-3">
                  <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${severityStyle[rule.severity]}`}>
                    {rule.severity}
                  </span>
                </td>
                <td className="px-4 py-3 text-right text-gray-600">{rule.passed.toLocaleString()}</td>
                <td className="px-4 py-3 text-right font-semibold text-red-600">{rule.failed}</td>
                <td className="px-4 py-3 text-right font-medium text-gray-900">
                  {((rule.passed / rule.total) * 100).toFixed(1)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
