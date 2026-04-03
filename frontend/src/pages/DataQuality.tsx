import { useState } from 'react'
import { RULES, SEV_BADGE } from '../components/quality/qualityData'
import { RuleTooltip, FailedDetail } from '../components/quality/QualityRuleComponents'
import { HealthGauge } from '../components/charts/HealthGauge'
import { QualityBarChart } from '../components/charts/QualityBarChart'

export default function DataQuality() {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const totalFailed = RULES.reduce((sum, r) => sum + r.failed, 0)
  const totalChecks = RULES.reduce((sum, r) => sum + r.total, 0)
  const globalScore = (totalChecks - totalFailed) / totalChecks * 100

  const barData = RULES.map(r => ({
    name: r.id,
    passRate: parseFloat(((r.passed / r.total) * 100).toFixed(2)),
    severity: r.severity,
  }))

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Data Quality</h1>
        <p className="text-sm text-gray-500 mt-1">Validation rule results — current reporting cycle</p>
      </div>

      <div className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" /></svg>
        <p className="text-sm text-amber-800 leading-relaxed">
          <span className="font-semibold">About this tab: </span>
          This tab shows the output of automated validation rules that run after every data ingestion.
          In regulatory reporting environments, silent data errors are more dangerous than visible failures
          — this pipeline is designed to surface issues before they reach the report.
        </p>
      </div>

      {/* Global Health Score */}
      <div className="rounded-xl border border-amber-200 bg-white p-6">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <HealthGauge score={globalScore} />
          <div className="flex-1 space-y-3">
            <div>
              <h2 className="text-base font-bold text-gray-900">Global Health Score</h2>
              <p className="text-sm text-gray-500 mt-0.5 leading-relaxed">
                Management-level KPI: percentage of all validation checks passing this cycle across every active rule.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Total Checks</p>
                <p className="text-2xl font-bold text-gray-800">{totalChecks.toLocaleString()}</p>
              </div>
              <div className="rounded-lg border border-red-100 bg-red-50 p-4">
                <p className="text-xs font-medium text-red-400 uppercase tracking-wide mb-1">Failed</p>
                <p className="text-2xl font-bold text-red-600">{totalFailed}</p>
              </div>
              <div className="rounded-lg border border-amber-100 bg-amber-50 p-4">
                <p className="text-xs font-medium text-amber-500 uppercase tracking-wide mb-1">Critical Rules</p>
                <p className="text-2xl font-bold text-amber-700">{RULES.filter(r => r.severity === 'Critical').length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bar chart */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="text-base font-semibold text-gray-800 mb-1">Pass Rate by Rule</h2>
        <p className="text-xs text-gray-400 italic mb-4">Automated validation of 1M+ records against Basel III technical standards.</p>
        <QualityBarChart data={barData} />
      </div>

      {/* Rules table */}
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 font-semibold text-gray-600">Rule ID</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Rule Name</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Severity</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Reg. Impact</th>
                <th className="px-4 py-3 font-semibold text-gray-600 text-right">Passed</th>
                <th className="px-4 py-3 font-semibold text-gray-600 text-right">Failed</th>
                <th className="px-4 py-3 font-semibold text-gray-600 text-right">Pass Rate</th>
                <th className="px-4 py-3 w-8" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {RULES.map(rule => {
                const isOpen = expandedId === rule.id
                const hasFailures = rule.failed > 0
                return (
                  <>
                    <tr key={rule.id}
                      className={`transition-colors ${hasFailures ? 'hover:bg-gray-50 cursor-pointer' : ''}`}
                      onClick={() => hasFailures && setExpandedId(isOpen ? null : rule.id)}>
                      <td className="px-4 py-3 font-mono text-gray-500">{rule.id}</td>
                      <td className="px-4 py-3 font-medium text-gray-800">
                        <RuleTooltip text={rule.tooltip}>
                          <span className="border-b border-dashed border-gray-400">{rule.name}</span>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1 inline-block"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" /></svg>
                        </RuleTooltip>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${SEV_BADGE[rule.severity]}`}>{rule.severity}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${
                          rule.regulatoryImpact === 'High' ? 'bg-red-100 text-red-700'
                          : rule.regulatoryImpact === 'Medium' ? 'bg-amber-100 text-amber-700'
                          : 'bg-slate-100 text-slate-600'
                        }`}>{rule.regulatoryImpact}</span>
                      </td>
                      <td className="px-4 py-3 text-right text-gray-600">{rule.passed.toLocaleString()}</td>
                      <td className={`px-4 py-3 text-right font-semibold ${rule.failed > 0 ? 'text-red-600' : 'text-emerald-600'}`}>{rule.failed}</td>
                      <td className="px-4 py-3 text-right font-medium text-gray-900">{((rule.passed / rule.total) * 100).toFixed(1)}%</td>
                      <td className="px-4 py-3 text-center select-none">
                        {hasFailures && (
                          <span className={`inline-block transition-transform duration-200 text-gray-400 text-xs ${isOpen ? 'rotate-180' : ''}`}>▼</span>
                        )}
                      </td>
                    </tr>
                    {isOpen && hasFailures && <FailedDetail key={`${rule.id}-detail`} rule={rule} />}
                  </>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
