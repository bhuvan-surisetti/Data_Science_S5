import { useNavigate } from 'react-router-dom'
import { Moon, Sun, RotateCcw, Info, Database } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAnalysis } from '../context/AnalysisContext'
import { useDarkMode } from '../hooks/useDarkMode'

export function Settings() {
  const { dark, toggle } = useDarkMode()
  const { analysis, sessionId, reset } = useAnalysis()
  const navigate = useNavigate()

  const handleReset = () => {
    reset()
    toast.success('Session cleared. Ready for a new dataset.')
    navigate('/')
  }

  return (
    <main className="main-content" style={{ paddingBottom: 48 }}>
      <div className="page-header">
        <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Settings</h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>Preferences and session management</p>
      </div>

      <div className="page-body" style={{ maxWidth: 600 }}>
        {/* Appearance */}
        <div className="card" style={{ padding: 28, marginBottom: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 20 }}>Appearance</h3>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {dark ? <Moon size={20} color="var(--color-blue)" /> : <Sun size={20} color="var(--color-amber)" />}
              <div>
                <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--color-text)' }}>Dark Mode</div>
                <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{dark ? 'Currently enabled' : 'Currently disabled'}</div>
              </div>
            </div>
            <button
              onClick={toggle}
              style={{
                width: 48, height: 26, borderRadius: 13, cursor: 'pointer', border: 'none',
                background: dark ? 'var(--color-blue)' : 'var(--color-surface-2)',
                position: 'relative', transition: 'background 0.2s',
              }}
            >
              <div style={{
                position: 'absolute', top: 3, left: dark ? 25 : 3, width: 20, height: 20,
                borderRadius: '50%', background: 'white',
                boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
                transition: 'left 0.2s',
              }} />
            </button>
          </div>
        </div>

        {/* Session info */}
        <div className="card" style={{ padding: 28, marginBottom: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 20 }}>Session Info</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { label: 'Session ID', value: sessionId ? sessionId.slice(0, 16) + '...' : 'None', icon: Info },
              { label: 'Dataset Rows', value: analysis?.preview?.rows?.toLocaleString() ?? 'N/A', icon: Database },
              { label: 'Date Range', value: analysis?.preview?.date_range ?? 'N/A', icon: Info },
              { label: 'Best ML Model', value: analysis?.ml?.best_model_name ?? 'N/A', icon: Info },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--color-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Icon size={14} color="var(--color-text-muted)" />
                  <span style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>{label}</span>
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)', fontFamily: 'monospace' }}>{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Reset */}
        <div className="card" style={{ padding: 28, border: '1px solid #fecaca' }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8, color: 'var(--color-red)' }}>Danger Zone</h3>
          <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 20 }}>
            Clear the current analysis and return to the upload screen. This cannot be undone.
          </p>
          <button className="btn btn-danger" onClick={handleReset}>
            <RotateCcw size={15} /> Reset Analysis
          </button>
        </div>
      </div>
    </main>
  )
}
