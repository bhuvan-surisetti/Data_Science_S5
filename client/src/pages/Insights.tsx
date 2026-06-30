import { useNavigate } from 'react-router-dom'
import { Lightbulb, Bookmark } from 'lucide-react'
import { useAnalysis } from '../context/AnalysisContext'
import { InsightCard } from '../components/InsightCard'

export function Insights() {
  const { analysis } = useAnalysis()
  const navigate = useNavigate()

  if (!analysis?.insights) {
    return (
      <main className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div style={{ textAlign: 'center' }}>
          <Lightbulb size={48} color="var(--color-text-muted)" style={{ margin: '0 auto 16px' }} />
          <h2 style={{ marginBottom: 12 }}>No Insights Yet</h2>
          <button className="btn btn-primary" onClick={() => navigate('/')}>Upload Dataset</button>
        </div>
      </main>
    )
  }

  const { insights, recommendations } = analysis.insights

  return (
    <main className="main-content" style={{ paddingBottom: 48 }}>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>AI Business Insights</h1>
            <p style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>
              {insights.length} insights · {recommendations.length} recommendations generated from your data
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <span className="badge badge-blue">{insights.filter((i: any) => i.severity === 'high').length} High Impact</span>
            <span className="badge badge-amber">{insights.filter((i: any) => i.severity === 'medium').length} Medium</span>
          </div>
        </div>
      </div>

      <div className="page-body">
        {/* Insights */}
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: 'var(--color-text)' }}>
          📊 Data-Driven Observations
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 36 }}>
          {insights.map((ins: any, i: number) => (
            <InsightCard key={ins.id} insight={ins} delay={i * 60} />
          ))}
        </div>

        {/* Recommendations */}
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: 'var(--color-text)' }}>
          🎯 Strategic Recommendations
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {recommendations.map((rec: string, i: number) => (
            <div
              key={i}
              className="animate-fade-in-up card"
              style={{ animationDelay: `${i * 50}ms`, padding: '16px 20px', display: 'flex', alignItems: 'flex-start', gap: 14 }}
            >
              <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--color-blue-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Bookmark size={13} color="var(--color-blue)" />
              </div>
              <div>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-blue)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Recommendation {i + 1}</span>
                <p style={{ fontSize: 13, color: 'var(--color-text)', marginTop: 4, lineHeight: 1.6 }}>{rec}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
