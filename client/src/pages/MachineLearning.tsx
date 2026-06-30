import { useNavigate } from 'react-router-dom'
import { BrainCircuit, Trophy, Clock, Zap, CheckCircle } from 'lucide-react'
import { useAnalysis } from '../context/AnalysisContext'
import { ModelComparisonChart } from '../components/ModelComparisonChart'
import { getBaseLayout, PLOTLY_COLORS, PLOTLY_CONFIG } from '../utils/chartConfig'
import { useDarkMode } from '../hooks/useDarkMode'
// @ts-ignore
import Plot from 'react-plotly.js'

export function MachineLearning() {
  const { analysis } = useAnalysis()
  const navigate = useNavigate()
  const { dark } = useDarkMode()
  const layout = getBaseLayout(dark)

  if (!analysis?.ml) {
    return (
      <main className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div style={{ textAlign: 'center' }}>
          <BrainCircuit size={48} color="var(--color-text-muted)" style={{ margin: '0 auto 16px' }} />
          <h2 style={{ marginBottom: 12 }}>No ML Results</h2>
          <button className="btn btn-primary" onClick={() => navigate('/')}>Upload Dataset</button>
        </div>
      </main>
    )
  }

  const { results, best_model_name, best_r2, feature_importance } = analysis.ml
  const valid = results.filter((r: any) => !r.error)

  return (
    <main className="main-content" style={{ paddingBottom: 48 }}>
      <div className="page-header">
        <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Machine Learning</h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>
          {valid.length} models trained and compared · Best: <strong>{best_model_name}</strong>
        </p>
      </div>

      <div className="page-body">
        {/* Best model banner */}
        <div className="card" style={{ padding: '24px 28px', marginBottom: 24, background: 'linear-gradient(135deg, #eff6ff, #eef2ff)', border: '1px solid #bfdbfe' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: 'var(--color-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Trophy size={24} color="white" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-blue)', marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Best Performing Model</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--color-text)' }}>{best_model_name}</div>
              <div style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 4 }}>
                R² Score: <strong>{best_r2.toFixed(4)}</strong> · Selected based on highest coefficient of determination across all trained models
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span className="badge badge-green" style={{ fontSize: 13, padding: '6px 14px' }}>
                <CheckCircle size={12} /> Selected
              </span>
            </div>
          </div>
        </div>

        {/* Model comparison chart */}
        <div className="chart-card" style={{ marginBottom: 24 }}>
          <div className="chart-header">
            <h3 style={{ fontSize: 15, fontWeight: 700 }}>R² Score Comparison</h3>
            <p style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>Higher is better (max = 1.0). The best model is highlighted in blue.</p>
          </div>
          <div className="chart-body">
            <ModelComparisonChart results={results} bestModelName={best_model_name} />
          </div>
        </div>

        {/* Metrics table */}
        <div className="card" style={{ marginBottom: 24, overflow: 'hidden' }}>
          <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--color-border)' }}>
            <h3 style={{ fontSize: 15, fontWeight: 700 }}>Detailed Metrics</h3>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Model</th>
                  <th>MAE</th>
                  <th>MSE</th>
                  <th>RMSE</th>
                  <th>R² Score</th>
                  <th>Train Time</th>
                  <th>Predict Time</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r: any) => (
                  <tr key={r.model} style={{ background: r.model === best_model_name ? 'rgba(37,99,235,0.04)' : undefined }}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {r.model === best_model_name && <Trophy size={12} color="var(--color-blue)" />}
                        <strong style={{ color: r.model === best_model_name ? 'var(--color-blue)' : 'var(--color-text)' }}>{r.model}</strong>
                      </div>
                    </td>
                    {r.error ? (
                      <td colSpan={6} style={{ color: 'var(--color-red)', fontSize: 12 }}>Error: {r.error}</td>
                    ) : (
                      <>
                        <td>{r.mae?.toFixed(2)}</td>
                        <td>{r.mse?.toFixed(2)}</td>
                        <td>{r.rmse?.toFixed(2)}</td>
                        <td>
                          <span style={{ fontWeight: 700, color: r.r2 >= 0.8 ? 'var(--color-green)' : r.r2 >= 0.5 ? 'var(--color-amber)' : 'var(--color-red)' }}>
                            {r.r2?.toFixed(4)}
                          </span>
                        </td>
                        <td style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Clock size={12} color="var(--color-text-muted)" />{r.training_time_s?.toFixed(3)}s
                        </td>
                        <td><Zap size={12} color="var(--color-text-muted)" style={{ display: 'inline', marginRight: 4 }} />{r.prediction_time_s?.toFixed(4)}s</td>
                      </>
                    )}
                    <td>
                      {r.error
                        ? <span className="badge badge-red">Error</span>
                        : r.model === best_model_name
                          ? <span className="badge badge-blue">Best</span>
                          : <span className="badge badge-gray">Trained</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Feature importance */}
        {feature_importance?.length > 0 && (
          <div className="chart-card">
            <div className="chart-header">
              <h3 style={{ fontSize: 15, fontWeight: 700 }}>Feature Importance</h3>
              <p style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>Which features most influence the {best_model_name} predictions</p>
            </div>
            <div className="chart-body">
              <Plot
                data={[{
                  x: feature_importance.map((f: any) => f.importance),
                  y: feature_importance.map((f: any) => f.feature),
                  type: 'bar', orientation: 'h',
                  marker: { color: PLOTLY_COLORS[0], opacity: 0.85 },
                  hovertemplate: '%{y}<br>Importance: %{x:.4f}<extra></extra>',
                }]}
                layout={{ ...layout, margin: { t: 10, r: 20, b: 40, l: 120 }, yaxis: { ...layout.yaxis, autorange: 'reversed' } }}
                config={PLOTLY_CONFIG} style={{ width: '100%', height: 300 }}
              />
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
