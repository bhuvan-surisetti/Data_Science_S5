import { useNavigate } from 'react-router-dom'
import { Sparkles, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'
import { useAnalysis } from '../context/AnalysisContext'

export function CleaningReport() {
  const { analysis } = useAnalysis()
  const navigate = useNavigate()

  if (!analysis?.cleaning) {
    return (
      <main className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div style={{ textAlign: 'center' }}>
          <Sparkles size={48} color="var(--color-text-muted)" style={{ margin: '0 auto 16px' }} />
          <h2 style={{ marginBottom: 12 }}>No Cleaning Report</h2>
          <button className="btn btn-primary" onClick={() => navigate('/')}>Upload Dataset</button>
        </div>
      </main>
    )
  }

  const { before, after, actions } = analysis.cleaning

  const diffStats = [
    { label: 'Rows Removed', before: before.rows, after: after.rows, delta: after.rows_removed, icon: XCircle, good: after.rows_removed === 0 },
    { label: 'Missing Values', before: before.missing_values, after: after.missing_values, delta: before.missing_values - after.missing_values, icon: AlertTriangle, good: after.missing_values === 0 },
    { label: 'Duplicates', before: before.duplicates, after: after.duplicates, delta: before.duplicates - after.duplicates, icon: CheckCircle, good: after.duplicates === 0 },
  ]

  return (
    <main className="main-content" style={{ paddingBottom: 48 }}>
      <div className="page-header">
        <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Data Cleaning Report</h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>Automated cleaning pipeline results</p>
      </div>
      <div className="page-body">
        {/* Before vs After */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 28 }}>
          {['Before Cleaning', 'After Cleaning'].map((label, idx) => {
            const d = idx === 0 ? before : after
            return (
              <div key={label} className="card" style={{ padding: 28, borderTop: `3px solid ${idx === 0 ? 'var(--color-amber)' : 'var(--color-green)'}` }}>
                <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 20, color: 'var(--color-text)' }}>{label}</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  {[
                    ['Rows', d.rows?.toLocaleString()],
                    ['Missing Values', d.missing_values],
                    ['Duplicates', d.duplicates],
                  ].map(([k, v]) => (
                    <div key={k as string}>
                      <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--color-text)' }}>{v}</div>
                      <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2 }}>{k}</div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {/* Delta cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 28 }}>
          {diffStats.map(({ label, delta, good }) => (
            <div key={label} className="card" style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: good ? '#ecfdf5' : '#fffbeb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircle size={18} color={good ? 'var(--color-green)' : 'var(--color-amber)'} />
              </div>
              <div>
                <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--color-text)' }}>{delta}</div>
                <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Actions log */}
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Actions Performed</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {actions.map((action: string, i: number) => (
              <div key={i} className="animate-fade-in-up" style={{ animationDelay: `${i * 50}ms`, display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 16px', borderRadius: 8, background: 'var(--color-surface)' }}>
                <CheckCircle size={15} color="var(--color-green)" style={{ marginTop: 1, flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: 'var(--color-text)', lineHeight: 1.5 }}>{action}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Feature columns */}
        {analysis.feature_columns?.length > 0 && (
          <div className="card" style={{ padding: 24, marginTop: 20 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Generated Features ({analysis.feature_columns.length})</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {analysis.feature_columns.map((col: string) => (
                <span key={col} className="badge badge-blue" style={{ fontSize: 12, padding: '4px 10px' }}>{col}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
