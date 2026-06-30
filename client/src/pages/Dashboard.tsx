import { useNavigate } from 'react-router-dom'
import {
  DollarSign, ShoppingCart, TrendingUp, Activity, Package,
  Tag, Star, MapPin, BarChart2, Layers, ArrowRight
} from 'lucide-react'
import { useAnalysis } from '../context/AnalysisContext'
import { KPICard } from '../components/KPICard'
import { ChartCard } from '../components/ChartCard'
import { ForecastChart } from '../components/ForecastChart'
import { getBaseLayout, PLOTLY_COLORS, PLOTLY_CONFIG } from '../utils/chartConfig'
import { useDarkMode } from '../hooks/useDarkMode'
// @ts-ignore
import Plot from 'react-plotly.js'

export function Dashboard() {
  const { analysis } = useAnalysis()
  const navigate = useNavigate()
  const { dark } = useDarkMode()
  const layout = getBaseLayout(dark)

  if (!analysis) {
    return (
      <main className="main-content" style={{ marginLeft: 'inherit', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div style={{ textAlign: 'center', padding: 48 }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--color-surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <BarChart2 size={32} color="var(--color-text-muted)" />
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>No Analysis Yet</h2>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: 24 }}>Upload a dataset to see your dashboard.</p>
          <button className="btn btn-primary" onClick={() => navigate('/')}>Upload Dataset <ArrowRight size={14} /></button>
        </div>
      </main>
    )
  }

  const kpis = analysis.kpis
  const charts = analysis.charts

  // Trend line chart data
  const trendData = charts.daily_trend || []
  const monthlyData = charts.monthly_sales || []

  return (
    <main className="main-content" style={{ paddingBottom: 48 }}>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--color-text)', marginBottom: 4 }}>Dashboard</h1>
            <p style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>{analysis.preview.date_range} · {analysis.preview.rows.toLocaleString()} records</p>
          </div>
          <span className="badge badge-green">Analysis Complete</span>
        </div>
      </div>

      <div className="page-body">
        {/* KPI Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
          <KPICard label="Total Revenue" value={kpis.total_revenue} format="currency" icon={<DollarSign size={18} />} trend={kpis.growth_pct} delay={0} />
          <KPICard label="Avg Daily Sales" value={kpis.avg_sales} format="currency" icon={<Activity size={18} />} delay={60} color="#10b981" />
          <KPICard label="Total Orders" value={kpis.total_orders} format="number" icon={<ShoppingCart size={18} />} delay={120} color="#f59e0b" />
          <KPICard label="Growth %" value={kpis.growth_pct} format="pct" icon={<TrendingUp size={18} />} delay={180} color={kpis.growth_pct >= 0 ? '#10b981' : '#ef4444'} />
          {kpis.unique_products !== undefined && <KPICard label="Unique Products" value={kpis.unique_products} format="number" icon={<Package size={18} />} delay={240} color="#8b5cf6" />}
          {kpis.avg_discount_pct !== undefined && <KPICard label="Avg Discount" value={kpis.avg_discount_pct} format="pct" icon={<Tag size={18} />} delay={300} color="#f97316" />}
          {kpis.highest_selling_product && <KPICard label="Top Product" value={kpis.highest_selling_product} icon={<Star size={18} />} delay={360} color="#eab308" />}
          {kpis.best_region && <KPICard label="Best Region" value={kpis.best_region} icon={<MapPin size={18} />} delay={420} color="#06b6d4" />}
        </div>

        {/* Revenue Trend + Forecast */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
          <ChartCard
            title="Revenue Trend"
            description="Daily sales aggregated over time"
            interpretation="Look for upward trends, seasonal spikes, and anomalies. Consistent growth signals a healthy business trajectory."
          >
            <Plot
              data={[{
                x: trendData.map((r: any) => r.date),
                y: trendData.map((r: any) => r.sales),
                type: 'scatter', mode: 'lines',
                fill: 'tozeroy',
                fillcolor: 'rgba(37,99,235,0.08)',
                line: { color: PLOTLY_COLORS[0], width: 2 },
                hovertemplate: '%{x}<br>$%{y:,.0f}<extra></extra>',
              }]}
              layout={{ ...layout, margin: { t: 10, r: 10, b: 40, l: 60 }, hovermode: 'x unified' }}
              config={PLOTLY_CONFIG}
              style={{ width: '100%', height: 280 }}
            />
          </ChartCard>

          <ChartCard
            title="30-Day Forecast"
            description="Predicted sales with confidence intervals"
            interpretation="The shaded area represents the 95% confidence interval. Use this for inventory and staffing planning."
          >
            <ForecastChart forecastData={analysis.forecast} />
          </ChartCard>
        </div>

        {/* Monthly + Category */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
          <ChartCard title="Monthly Sales" description="Revenue aggregated by month" interpretation="Identify peak months to optimize campaigns and inventory.">
            <Plot
              data={[{
                x: monthlyData.map((r: any) => r.label),
                y: monthlyData.map((r: any) => r.sales),
                type: 'bar',
                marker: { color: PLOTLY_COLORS[0], opacity: 0.85 },
                hovertemplate: '%{x}<br>$%{y:,.0f}<extra></extra>',
              }]}
              layout={{ ...layout, margin: { t: 10, r: 10, b: 50, l: 60 } }}
              config={PLOTLY_CONFIG}
              style={{ width: '100%', height: 260 }}
            />
          </ChartCard>

          {charts.category_sales?.length > 0 ? (
            <ChartCard title="Category Breakdown" description="Revenue share by product category" interpretation="Diversify category focus to reduce concentration risk.">
              <Plot
                data={[{
                  labels: charts.category_sales.map((r: any) => r.category),
                  values: charts.category_sales.map((r: any) => r.sales),
                  type: 'pie', hole: 0.45,
                  marker: { colors: PLOTLY_COLORS },
                  hovertemplate: '<b>%{label}</b><br>$%{value:,.0f}<br>%{percent}<extra></extra>',
                  textinfo: 'label+percent',
                  textfont: { size: 11 },
                }]}
                layout={{ ...layout, margin: { t: 10, r: 10, b: 10, l: 10 }, showlegend: false }}
                config={PLOTLY_CONFIG}
                style={{ width: '100%', height: 260 }}
              />
            </ChartCard>
          ) : (
            <ChartCard title="Weekly Pattern" description="Average sales by day of week" interpretation="Use this to schedule promotions on low-traffic days.">
              <Plot
                data={[{
                  x: (charts.weekday_sales || []).map((r: any) => r.day),
                  y: (charts.weekday_sales || []).map((r: any) => r.sales),
                  type: 'bar',
                  marker: { color: PLOTLY_COLORS[1] },
                  hovertemplate: '%{x}<br>$%{y:,.0f}<extra></extra>',
                }]}
                layout={{ ...layout, margin: { t: 10, r: 10, b: 40, l: 60 } }}
                config={PLOTLY_CONFIG}
                style={{ width: '100%', height: 260 }}
              />
            </ChartCard>
          )}
        </div>

        {/* ML Best Model Banner */}
        {analysis.ml && (
          <div className="card" style={{ padding: '20px 28px', display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--color-blue-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Layers size={20} color="var(--color-blue)" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, color: 'var(--color-text)', marginBottom: 2 }}>
                Best Model: <span style={{ color: 'var(--color-blue)' }}>{analysis.ml.best_model_name}</span>
              </div>
              <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
                R² Score: <strong>{analysis.ml.best_r2.toFixed(4)}</strong> · Selected from {analysis.ml.results.filter(r => !r.error).length} models
              </div>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/app/ml')}>View ML Details <ArrowRight size={12} /></button>
          </div>
        )}

        {/* Insights preview */}
        {analysis.insights?.insights?.slice(0, 2).map((ins: any) => (
          <div key={ins.id} className={`insight-card type-${ins.type}`} style={{ marginBottom: 12 }}>
            <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{ins.title}</p>
            <p style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>{ins.text}</p>
          </div>
        ))}
        {analysis.insights?.insights?.length > 2 && (
          <button className="btn btn-secondary" style={{ width: '100%' }} onClick={() => navigate('/app/insights')}>
            View All {analysis.insights.insight_count} Insights <ArrowRight size={14} />
          </button>
        )}
      </div>
    </main>
  )
}
