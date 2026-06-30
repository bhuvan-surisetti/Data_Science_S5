import { useNavigate } from 'react-router-dom'
import { BarChart2 } from 'lucide-react'
import { useAnalysis } from '../context/AnalysisContext'
import { ChartCard } from '../components/ChartCard'
import { getBaseLayout, PLOTLY_COLORS, PLOTLY_CONFIG } from '../utils/chartConfig'
import { useDarkMode } from '../hooks/useDarkMode'
// @ts-ignore
import Plot from 'react-plotly.js'

export function EDA() {
  const { analysis } = useAnalysis()
  const navigate = useNavigate()
  const { dark } = useDarkMode()
  const layout = getBaseLayout(dark)

  if (!analysis) {
    return (
      <main className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div style={{ textAlign: 'center' }}>
          <BarChart2 size={48} color="var(--color-text-muted)" style={{ margin: '0 auto 16px' }} />
          <h2 style={{ marginBottom: 12 }}>No EDA Available</h2>
          <button className="btn btn-primary" onClick={() => navigate('/')}>Upload Dataset</button>
        </div>
      </main>
    )
  }

  const charts = analysis.charts

  return (
    <main className="main-content" style={{ paddingBottom: 48 }}>
      <div className="page-header">
        <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Exploratory Data Analysis</h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>Interactive visualizations — hover, zoom, and export each chart</p>
      </div>

      <div className="page-body">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 20 }}>

          {/* Sales Trend */}
          {charts.daily_trend && (
            <ChartCard title="Daily Sales Trend" description="Total sales per day across the full dataset" interpretation="Look for seasonality patterns, growth momentum, and anomalous spikes or drops." delay={0}>
              <Plot
                data={[{ x: charts.daily_trend.map((r: any) => r.date), y: charts.daily_trend.map((r: any) => r.sales), type: 'scatter', mode: 'lines', fill: 'tozeroy', fillcolor: 'rgba(37,99,235,0.07)', line: { color: PLOTLY_COLORS[0], width: 2 }, hovertemplate: '%{x}<br>$%{y:,.0f}<extra></extra>' }]}
                layout={{ ...layout, margin: { t: 10, r: 20, b: 50, l: 70 }, hovermode: 'x unified' }}
                config={PLOTLY_CONFIG} style={{ width: '100%', height: 300 }}
              />
            </ChartCard>
          )}

          {/* Monthly + Yearly */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            {charts.monthly_sales && (
              <ChartCard title="Monthly Sales" description="Revenue by month" interpretation="December and Q4 months typically outperform others due to holiday demand." delay={60}>
                <Plot
                  data={[{ x: charts.monthly_sales.map((r: any) => r.label), y: charts.monthly_sales.map((r: any) => r.sales), type: 'bar', marker: { color: PLOTLY_COLORS[0], opacity: 0.85 }, hovertemplate: '%{x}<br>$%{y:,.0f}<extra></extra>' }]}
                  layout={{ ...layout, margin: { t: 10, r: 10, b: 60, l: 70 } }}
                  config={PLOTLY_CONFIG} style={{ width: '100%', height: 280 }}
                />
              </ChartCard>
            )}
            {charts.yearly_sales && (
              <ChartCard title="Yearly Sales" description="Annual revenue comparison" interpretation="Year-over-year growth indicates business health and market expansion." delay={80}>
                <Plot
                  data={[{ x: charts.yearly_sales.map((r: any) => r.year.toString()), y: charts.yearly_sales.map((r: any) => r.sales), type: 'bar', marker: { color: PLOTLY_COLORS[1], opacity: 0.85 }, hovertemplate: '%{x}<br>$%{y:,.0f}<extra></extra>' }]}
                  layout={{ ...layout, margin: { t: 10, r: 10, b: 40, l: 70 } }}
                  config={PLOTLY_CONFIG} style={{ width: '100%', height: 280 }}
                />
              </ChartCard>
            )}
          </div>

          {/* Quarterly + Seasonal */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            {charts.quarterly_sales && (
              <ChartCard title="Quarterly Revenue" description="Revenue by business quarter" interpretation="Q4 often spikes due to holiday sales. Q1 dips are common post-holiday." delay={100}>
                <Plot
                  data={[{ x: charts.quarterly_sales.map((r: any) => r.label), y: charts.quarterly_sales.map((r: any) => r.sales), type: 'bar', marker: { color: PLOTLY_COLORS[2] }, hovertemplate: '%{x}<br>$%{y:,.0f}<extra></extra>' }]}
                  layout={{ ...layout, margin: { t: 10, r: 10, b: 40, l: 70 } }}
                  config={PLOTLY_CONFIG} style={{ width: '100%', height: 260 }}
                />
              </ChartCard>
            )}
            {charts.season_sales && (
              <ChartCard title="Sales by Season" description="Revenue distribution across seasons" interpretation="Summer and Winter typically show the most extremes. Align procurement cycles accordingly." delay={120}>
                <Plot
                  data={[{ labels: charts.season_sales.map((r: any) => r.season), values: charts.season_sales.map((r: any) => r.sales), type: 'pie', hole: 0.5, marker: { colors: [PLOTLY_COLORS[2], PLOTLY_COLORS[0], PLOTLY_COLORS[1], PLOTLY_COLORS[4]] }, textinfo: 'label+percent', hovertemplate: '<b>%{label}</b><br>$%{value:,.0f}<extra></extra>' }]}
                  layout={{ ...layout, margin: { t: 10, r: 10, b: 10, l: 10 }, showlegend: false }}
                  config={PLOTLY_CONFIG} style={{ width: '100%', height: 260 }}
                />
              </ChartCard>
            )}
          </div>

          {/* Weekly pattern */}
          {charts.weekday_sales && (
            <ChartCard title="Sales by Day of Week" description="Average sales for each day" interpretation="If weekends drive higher sales, consider staffing up on Fridays and targeting ads mid-week." delay={140}>
              <Plot
                data={[{ x: charts.weekday_sales.map((r: any) => r.day), y: charts.weekday_sales.map((r: any) => r.sales), type: 'bar', marker: { color: charts.weekday_sales.map((r: any) => r.day === 'Sat' || r.day === 'Sun' ? PLOTLY_COLORS[1] : PLOTLY_COLORS[0]), opacity: 0.85 }, hovertemplate: '%{x}<br>$%{y:,.0f}<extra></extra>' }]}
                layout={{ ...layout, margin: { t: 10, r: 10, b: 40, l: 70 } }}
                config={PLOTLY_CONFIG} style={{ width: '100%', height: 260 }}
              />
            </ChartCard>
          )}

          {/* Category + Region */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            {charts.category_sales && (
              <ChartCard title="Category-wise Sales" description="Revenue by product category" interpretation="Allocate marketing budget proportionally to each category's revenue contribution." delay={160}>
                <Plot
                  data={[{ x: charts.category_sales.map((r: any) => r.category), y: charts.category_sales.map((r: any) => r.sales), type: 'bar', marker: { color: PLOTLY_COLORS }, hovertemplate: '%{x}<br>$%{y:,.0f}<extra></extra>' }]}
                  layout={{ ...layout, margin: { t: 10, r: 10, b: 60, l: 70 } }}
                  config={PLOTLY_CONFIG} style={{ width: '100%', height: 280 }}
                />
              </ChartCard>
            )}
            {charts.region_sales && (
              <ChartCard title="Region-wise Sales" description="Revenue breakdown by region" interpretation="Underperforming regions represent untapped markets that may respond to targeted campaigns." delay={180}>
                <Plot
                  data={[{ labels: charts.region_sales.map((r: any) => r.region), values: charts.region_sales.map((r: any) => r.sales), type: 'pie', marker: { colors: PLOTLY_COLORS }, textinfo: 'label+percent', hovertemplate: '<b>%{label}</b><br>$%{value:,.0f}<extra></extra>' }]}
                  layout={{ ...layout, margin: { t: 10, r: 10, b: 10, l: 10 }, showlegend: false }}
                  config={PLOTLY_CONFIG} style={{ width: '100%', height: 280 }}
                />
              </ChartCard>
            )}
          </div>

          {/* Top + Bottom products */}
          {charts.top_products && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <ChartCard title="Top 10 Products" description="Highest-revenue products" interpretation="Invest in consistent stock levels for your top 10 products to avoid lost sales." delay={200}>
                <Plot
                  data={[{ x: charts.top_products.map((r: any) => r.sales), y: charts.top_products.map((r: any) => r.product), type: 'bar', orientation: 'h', marker: { color: PLOTLY_COLORS[0] }, hovertemplate: '%{y}<br>$%{x:,.0f}<extra></extra>' }]}
                  layout={{ ...layout, margin: { t: 10, r: 20, b: 40, l: 120 }, yaxis: { ...layout.yaxis, autorange: 'reversed' } }}
                  config={PLOTLY_CONFIG} style={{ width: '100%', height: 320 }}
                />
              </ChartCard>
              <ChartCard title="Bottom 10 Products" description="Lowest-revenue products – candidates for discontinuation" interpretation="Review if these products should be bundled, promoted, or phased out to reduce inventory costs." delay={220}>
                <Plot
                  data={[{ x: charts.bottom_products.map((r: any) => r.sales), y: charts.bottom_products.map((r: any) => r.product), type: 'bar', orientation: 'h', marker: { color: PLOTLY_COLORS[3] }, hovertemplate: '%{y}<br>$%{x:,.0f}<extra></extra>' }]}
                  layout={{ ...layout, margin: { t: 10, r: 20, b: 40, l: 120 } }}
                  config={PLOTLY_CONFIG} style={{ width: '100%', height: 320 }}
                />
              </ChartCard>
            </div>
          )}

          {/* Histogram */}
          {charts.sales_histogram && (
            <ChartCard title="Sales Distribution" description="Histogram of individual sale amounts" interpretation="A right-skewed distribution suggests most transactions are small-value, with a few high-value orders driving revenue." delay={240}>
              <Plot
                data={[{ x: charts.sales_histogram.map((r: any) => r.bin), y: charts.sales_histogram.map((r: any) => r.count), type: 'bar', marker: { color: PLOTLY_COLORS[4], opacity: 0.8 }, hovertemplate: 'Range: %{x}<br>Count: %{y}<extra></extra>' }]}
                layout={{ ...layout, margin: { t: 10, r: 20, b: 60, l: 60 }, bargap: 0.05 }}
                config={PLOTLY_CONFIG} style={{ width: '100%', height: 280 }}
              />
            </ChartCard>
          )}

          {/* Discount scatter */}
          {charts.discount_vs_sales && (
            <ChartCard title="Discount vs Sales" description="Scatter plot of discount rate against sale amount" interpretation="If higher discounts correlate with lower total sales, your discount strategy may be eroding average order value." delay={260}>
              <Plot
                data={[{ x: charts.discount_vs_sales.map((r: any) => r.discount * 100), y: charts.discount_vs_sales.map((r: any) => r.sales), type: 'scatter', mode: 'markers', marker: { color: PLOTLY_COLORS[5], size: 5, opacity: 0.6 }, hovertemplate: 'Discount: %{x:.0f}%<br>Sales: $%{y:,.0f}<extra></extra>' }]}
                layout={{ ...layout, xaxis: { ...layout.xaxis, title: 'Discount (%)' }, yaxis: { ...layout.yaxis, title: 'Sale Amount ($)' }, margin: { t: 10, r: 20, b: 60, l: 80 } }}
                config={PLOTLY_CONFIG} style={{ width: '100%', height: 300 }}
              />
            </ChartCard>
          )}

          {/* Correlation heatmap */}
          {charts.correlation && (
            <ChartCard title="Feature Correlation Heatmap" description="Pearson correlation between numeric variables" interpretation="High positive correlations (blue) indicate features that move together. Use this to identify redundant or highly predictive variables." delay={280}>
              <Plot
                data={[{
                  z: charts.correlation.matrix,
                  x: charts.correlation.columns,
                  y: charts.correlation.columns,
                  type: 'heatmap',
                  colorscale: [['0', '#ef4444'], ['0.5', '#f8fafc'], ['1', '#2563eb']],
                  zmin: -1, zmax: 1,
                  hovertemplate: '%{y} × %{x}<br>Correlation: %{z:.3f}<extra></extra>',
                  showscale: true,
                  text: charts.correlation.matrix.map((row: number[]) => row.map((v: number) => v.toFixed(2))),
                  texttemplate: '%{text}',
                }]}
                layout={{ ...layout, margin: { t: 10, r: 100, b: 80, l: 100 }, xaxis: { ...layout.xaxis, side: 'bottom' } }}
                config={PLOTLY_CONFIG} style={{ width: '100%', height: 340 }}
              />
            </ChartCard>
          )}
        </div>
      </div>
    </main>
  )
}
