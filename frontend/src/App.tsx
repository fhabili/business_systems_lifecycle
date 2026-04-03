import { useState } from 'react'
import { Layers } from 'lucide-react'
import { NavBar } from './components/layout/NavBar'
import { ChatPanel } from './components/chat/ChatPanel'
import Home from './pages/Home'
import ExecutiveSummary from './pages/ExecutiveSummary'
import Liquidity from './pages/Liquidity'
import Governance from './pages/Governance'
import SystemArchitecture from './pages/SystemArchitecture'

const tabs = [
  { id: 'overview',     label: 'Executive Terminal', accent: '#10B981' },
  { id: 'liquidity',    label: 'Liquidity',     accent: '#2563EB' },
  { id: 'governance',   label: 'Governance',    accent: '#F59E0B' },
]

function App() {
  const [activeTab, setActiveTab] = useState('overview')
  const [menuOpen, setMenuOpen]   = useState(false)
  const [showHome, setShowHome]   = useState(true)
  const [chatOpen, setChatOpen]   = useState(true)
  const activeAccent = tabs.find(t => t.id === activeTab)?.accent ?? '#10B981'

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

      <div className="flex flex-1 overflow-hidden max-w-[1360px] w-full mx-auto">
        {/* AI Sidebar */}
        <aside className="hidden md:flex flex-col w-[280px] shrink-0 min-h-0 border-r border-gray-200 bg-white">
          <div className="flex-1 min-h-0 flex flex-col">
            {chatOpen ? (
              <ChatPanel onClose={() => setChatOpen(false)} />
            ) : (
              <div className="flex flex-col items-center pt-8">
                <button
                  onClick={() => setChatOpen(true)}
                  className="flex flex-col items-center gap-2 rounded-xl px-2 py-4 text-white shadow transition-colors"
                  style={{ backgroundColor: activeAccent }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = activeAccent + 'CC')}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = activeAccent)}
                  title="Open AI Assistant"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></svg>
                  <span className="text-[10px] font-semibold tracking-widest" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>AI</span>
                </button>
              </div>
            )}
          </div>
          {/* Secondary navigation — System Architecture */}
          <div className="border-t border-gray-200 p-4 flex justify-center">
            <button
              onClick={() => navigate('architecture')}
              className="flex flex-col items-center gap-1.5 rounded-lg px-3 py-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              title="System Architecture"
            >
              <Layers className="w-4 h-4" />
              <span className="text-[9px] font-semibold tracking-widest uppercase">Architecture</span>
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0 min-h-0 overflow-y-scroll py-6 md:py-8 px-6 md:px-8">
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
