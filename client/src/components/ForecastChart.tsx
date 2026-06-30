import { getBaseLayout, PLOTLY_COLORS, PLOTLY_CONFIG } from '../utils/chartConfig'
import { useDarkMode } from '../hooks/useDarkMode'
// @ts-ignore
import Plot from 'react-plotly.js'

export function ForecastChart({ forecastData }: { forecastData: any }) {
  const { dark } = useDarkMode()
  const layout = getBaseLayout(dark)

  if (!forecastData?.forecast_table?.length) return null

  const historical = forecastData.historical || []
  const forecast = forecastData.forecast_table || []

  const histDates = historical.map((r: any) => r.date)
  const histSales = historical.map((r: any) => r.sales)

  const fcDates = forecast.map((r: any) => r.date)
  const fcValues = forecast.map((r: any) => r.forecast)
  const lowerCI = forecast.map((r: any) => r.lower_ci)
  const upperCI = forecast.map((r: any) => r.upper_ci)

  const traces: any[] = [
    {
      x: histDates, y: histSales,
      type: 'scatter', mode: 'lines',
      name: 'Historical Sales',
      line: { color: PLOTLY_COLORS[0], width: 2 },
      hovertemplate: 'Date: %{x}<br>Sales: $%{y:,.0f}<extra></extra>',
    },
    {
      x: [...fcDates, ...fcDates.slice().reverse()],
      y: [...upperCI, ...lowerCI.slice().reverse()],
      type: 'scatter', fill: 'toself', fillcolor: 'rgba(37,99,235,0.1)',
      line: { color: 'transparent' }, name: '95% Confidence',
      hoverinfo: 'skip',
    },
    {
      x: fcDates, y: fcValues,
      type: 'scatter', mode: 'lines',
      name: 'Forecast',
      line: { color: PLOTLY_COLORS[1], width: 2, dash: 'dash' },
      hovertemplate: 'Date: %{x}<br>Forecast: $%{y:,.0f}<extra></extra>',
    },
  ]

  return (
    <Plot
      data={traces}
      layout={{
        ...layout,
        margin: { t: 10, r: 20, b: 50, l: 60 },
        hovermode: 'x unified',
        showlegend: true,
        legend: { x: 0, y: 1.1, orientation: 'h' },
        shapes: [{
          type: 'line',
          x0: fcDates[0], x1: fcDates[0],
          y0: 0, y1: 1, yref: 'paper',
          line: { color: '#94a3b8', width: 1, dash: 'dot' },
        }],
      }}
      config={PLOTLY_CONFIG}
      style={{ width: '100%', height: 360 }}
    />
  )
}
