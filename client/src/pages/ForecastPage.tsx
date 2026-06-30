import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TrendingUp, ArrowUp, ArrowDown } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAnalysis } from '../context/AnalysisContext'
import { ForecastChart } from '../components/ForecastChart'
import { runForecast } from '../services/api'
import { formatCurrency } from '../utils/formatters'

const HORIZONS = [
  { days: 7, label: '7 Days', desc: 'Short-term' },
  { days: 30, label: '30 Days', desc: 'Monthly' },
  { days: 90, label: '90 Days', desc: 'Quarterly' },
  { days: 180, label: '180 Days', desc: 'Half-year' },
  { days: 365, label: '365 Days', desc: 'Annual' },
]

export function ForecastPage() {
  const { analysis, sessionId } = useAnalysis()
  const navigate = useNavigate()
  const [selectedHorizon, setSelectedHorizon] = useState(30)
  const [loading, setLoading] = useState(false)
  const [forecastData, setForecastData] = useState<any>(null)

  const fc = forecastData ?? analysis?.forecast

  if (!analysis) {
    return (
      <main className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div style={{ textAlign: 'center' }}>
          <TrendingUp size={48} color="var(--color-text-muted)" style={{ margin: '0 auto 16px' }} />
          <h2 style={{ marginBottom: 12 }}>No Forecast Available</h2>
          <button className="btn btn-primary" onClick={() => navigate('/')}>Upload Dataset</button>
        </div>
      </main>
    )
  }

  const handleForecast = async (days: number) => {
    if (!sessionId) return
    setSelectedHorizon(days)
    setLoading(true)
    try {
      const res = await runForecast(sessionId, days)
      setForecastData(res.data)
      toast.success(`${days}-day forecast generated!`)
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Forecast failed.')
    } finally {
      setLoading(false)
    }
  }

  const growth = fc?.growth_pct_vs_recent ?? 0
  const GrowthIcon = growth >= 0 ? ArrowUp : ArrowDown

  return (
    <main className="main-content" style={{ paddingBottom: 48 }}>
      <div className="page-header">
        <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Sales Forecast</h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>ML-powered predictions with 95% confidence intervals</p>
      </div>
      <div className="page-body">
        {/* Horizon selector */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
          {HORIZONS.map(({ days, label, desc }) => (
            <button
              key={days}
              onClick={() => handleForecast(days)}
              disabled={loading}
              className={`btn ${selectedHorizon === days ? 'btn-primary' : 'btn-secondary'}`}
              style={{ flexDirection: 'column', gap: 2, padding: '12px 20px', alignItems: 'center' }}
            >
              <span style={{ fontSize: 14, fontWeight: 700 }}>{label}</span>
              <span style={{ fontSize: 10, opacity: 0.7 }}>{desc}</span>
            </button>
          ))}
          {loading && <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--color-text-muted)' }}>
            <div className="animate-spin" style={{ width: 16, height: 16, border: '2px solid var(--color-border)', borderTopColor: 'var(--color-blue)', borderRadius: '50%' }} />
            Forecasting…
          </div>}
        </div>

        {/* Summary KPIs */}
        {fc && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
            <div className="card" style={{ padding: '20px 24px' }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Total Forecast Revenue</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--color-text)' }}>{formatCurrency(fc.total_forecast)}</div>
              <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 4 }}>Over next {fc.horizon_days} days</div>
            </div>
            <div className="card" style={{ padding: '20px 24px' }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Avg Daily Forecast</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--color-text)' }}>{formatCurrency(fc.avg_daily_forecast)}</div>
              <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 4 }}>Per day average</div>
            </div>
            <div className="card" style={{ padding: '20px 24px' }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Growth vs Last 30 Days</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: growth >= 0 ? 'var(--color-green)' : 'var(--color-red)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <GrowthIcon size={22} />
                {Math.abs(growth).toFixed(1)}%
              </div>
              <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 4 }}>
                {growth >= 0 ? 'Projected growth' : 'Projected decline'}
              </div>
            </div>
          </div>
        )}

        {/* Forecast chart */}
        {fc && (
          <div className="chart-card" style={{ marginBottom: 24 }}>
            <div className="chart-header">
              <h3 style={{ fontSize: 15, fontWeight: 700 }}>Forecast Chart</h3>
              <p style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>Historical data (solid) + {selectedHorizon}-day forecast (dashed) with 95% CI shading</p>
            </div>
            <div className="chart-body">
              <ForecastChart forecastData={fc} />
            </div>
          </div>
        )}

        {/* Forecast table */}
        {fc?.forecast_table && (
          <div className="card" style={{ overflow: 'hidden' }}>
            <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: 15, fontWeight: 700 }}>Forecast Table</h3>
              <span className="badge badge-gray">{fc.forecast_table.length} days</span>
            </div>
            <div style={{ maxHeight: 400, overflowY: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Forecast ($)</th>
                    <th>Lower CI ($)</th>
                    <th>Upper CI ($)</th>
                  </tr>
                </thead>
                <tbody>
                  {fc.forecast_table.map((row: any) => (
                    <tr key={row.date}>
                      <td style={{ fontWeight: 500 }}>{row.date}</td>
                      <td style={{ fontWeight: 700, color: 'var(--color-blue)' }}>${row.forecast.toLocaleString()}</td>
                      <td style={{ color: 'var(--color-text-muted)' }}>${row.lower_ci.toLocaleString()}</td>
                      <td style={{ color: 'var(--color-text-muted)' }}>${row.upper_ci.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
