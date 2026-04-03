import { useState } from 'react'
import type { Metric } from '../components/lineage/lineageData'
import { DataFlowDiagram, TracePanel } from '../components/lineage/LineageComponents'

export default function DataLineage() {
  const [traceActive, setTraceActive] = useState(false)

  function handleTrace(_metric: Metric, _quarter: string) {
    setTraceActive(true)
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Data Lineage</h1>
        <p className="text-sm text-gray-500 mt-1">Interactive provenance tracing for Basel III regulatory metrics.</p>
      </div>

      <TracePanel onTrace={handleTrace} />
      <DataFlowDiagram />

      {traceActive && (
        <div className="space-y-4">
          <p className="text-xs text-gray-400 font-semibold uppercase tracking-widest">Detail Layers</p>
          <p className="text-sm text-gray-600 italic">Layer detail inspection will appear here when trace is active.</p>
        </div>
      )}
    </div>
  )
}
