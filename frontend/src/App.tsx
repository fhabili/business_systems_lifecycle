import { useState } from 'react'
import { NavBar } from './components/layout/NavBar'
import { Sidebar } from './components/chat/ChatPanel'
import Home from './pages/Home'
import ExecutiveSummary from './pages/ExecutiveSummary'
import Liquidity from './pages/Liquidity'
import Governance from './pages/Governance'
import SystemArchitecture from './pages/SystemArchitecture'

const tabs = [
  { id: 'overview',     label: 'Executive Terminal', accent: '#10B981' },
  { id: 'liquidity',    label: 'Liquidity',     accent: '#2563EB' },
  { id: 'governance',   label: 'Governance',    accent: '#F59E0B' },
  { id: 'architecture', label: 'About',         accent: '#374151' },
]

function App() {
  const [activeTab, setActiveTab] = useState('overview')
  const [menuOpen, setMenuOpen]   = useState(false)
  const [showHome, setShowHome]   = useState(true)
  const [chatOpen, setChatOpen]   = useState(true)

  function navigate(id: string) {
    setActiveTab(id)
    setMenuOpen(false)
  }

  if (showHome) {
    return <Home onEnter={() => setShowHome(false)} />
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      <NavBar tabs={tabs} activeTab={activeTab} menuOpen={menuOpen} onNavigate={navigate} onToggleMenu={() => setMenuOpen(o => !o)} onGoHome={() => setShowHome(true)} />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar open={chatOpen} onToggle={() => setChatOpen(o => !o)} />

        {/* Main content */}
        <main className="flex-1 min-w-0 min-h-0 overflow-y-auto py-6 md:py-8 px-6 md:px-10">
          {activeTab === 'overview'     && <ExecutiveSummary />}
          {activeTab === 'liquidity'    && <Liquidity />}
          {activeTab === 'governance'   && <Governance />}
          {activeTab === 'architecture' && <SystemArchitecture />}
        </main>
      </div>
    </div>
  )
}

export default App
