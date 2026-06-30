import { getBaseLayout, PLOTLY_COLORS, PLOTLY_CONFIG } from '../utils/chartConfig'
import { useDarkMode } from '../hooks/useDarkMode'
// @ts-ignore
import Plot from 'react-plotly.js'
import type { ModelResult } from '../context/AnalysisContext'

interface Props { results: ModelResult[]; bestModelName: string }

export function ModelComparisonChart({ results, bestModelName }: Props) {
  const { dark } = useDarkMode()
  const layout = getBaseLayout(dark)

  const valid = results.filter(r => !r.error)
  const models = valid.map(r => r.model)
  const r2Values = valid.map(r => r.r2 ?? 0)

  const barColors = models.map(m => m === bestModelName ? PLOTLY_COLORS[0] : PLOTLY_COLORS[8])

  return (
    <Plot
      data={[
        {
          x: models, y: r2Values,
          type: 'bar', name: 'R² Score',
          marker: { color: barColors, opacity: 0.9 },
          hovertemplate: '<b>%{x}</b><br>R²: %{y:.4f}<extra></extra>',
          text: r2Values.map(v => v.toFixed(3)),
          textposition: 'outside',
        },
      ]}
      layout={{
        ...layout,
        yaxis: { ...layout.yaxis, title: 'R² Score (higher = better)', range: [Math.min(...r2Values) - 0.05, 1.0] },
        xaxis: { ...layout.xaxis, title: '' },
        margin: { t: 20, r: 20, b: 60, l: 60 },
        showlegend: false,
        annotations: [{
          x: bestModelName, y: (Math.max(...r2Values) + 0.03),
          text: '⭐ Best',
          showarrow: false,
          font: { size: 12, color: PLOTLY_COLORS[0] },
        }],
      }}
      config={PLOTLY_CONFIG}
      style={{ width: '100%', height: 300 }}
    />
  )
}
