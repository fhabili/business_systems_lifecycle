import { useState } from 'react'
import ExecutiveSummary from './pages/ExecutiveSummary'
import LCRDetail from './pages/LCRDetail'
import NSFRDetail from './pages/NSFRDetail'
import DataQuality from './pages/DataQuality'
import DataLineage from './pages/DataLineage'

const tabs = [
  { id: 'summary', label: 'Executive Summary' },
  { id: 'lcr', label: 'LCR Detail' },
  { id: 'nsfr', label: 'NSFR Detail' },
  { id: 'quality', label: 'Data Quality' },
  { id: 'lineage', label: 'Data Lineage' },
]

function App() {
  const [activeTab, setActiveTab] = useState('summary')

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <h1 className="text-lg font-bold text-gray-900 tracking-tight">
          Liquidity Risk Reporting System
        </h1>
        <p className="text-xs text-gray-400 mt-0.5">Basel III Regulatory Dashboard</p>
      </header>

      <nav className="bg-white border-b border-gray-200 px-6">
        <div className="flex gap-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {activeTab === 'summary' && <ExecutiveSummary />}
        {activeTab === 'lcr' && <LCRDetail />}
        {activeTab === 'nsfr' && <NSFRDetail />}
        {activeTab === 'quality' && <DataQuality />}
        {activeTab === 'lineage' && <DataLineage />}
      </main>
    </div>
  )
}

export default App
