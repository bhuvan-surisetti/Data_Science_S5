export const PLOTLY_COLORS = [
  '#2563EB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
  '#06B6D4', '#F97316', '#EC4899', '#84CC16', '#6366F1',
]

export const getBaseLayout = (dark = false) => ({
  paper_bgcolor: 'transparent',
  plot_bgcolor: 'transparent',
  font: {
    family: 'Outfit, -apple-system, sans-serif',
    size: 12,
    color: dark ? '#94a3b8' : '#64748b',
  },
  margin: { t: 20, r: 20, b: 40, l: 50 },
  xaxis: {
    gridcolor: dark ? '#1e2942' : '#f1f5f9',
    linecolor: dark ? '#1e2942' : '#e2e8f0',
    tickfont: { size: 11 },
    showgrid: true,
    zeroline: false,
  },
  yaxis: {
    gridcolor: dark ? '#1e2942' : '#f1f5f9',
    linecolor: dark ? '#1e2942' : '#e2e8f0',
    tickfont: { size: 11 },
    showgrid: true,
    zeroline: false,
  },
  legend: {
    bgcolor: 'transparent',
    borderwidth: 0,
    font: { size: 12 },
  },
  hoverlabel: {
    bgcolor: dark ? '#1e2942' : '#0f172a',
    bordercolor: 'transparent',
    font: { color: 'white', size: 12, family: 'Outfit, sans-serif' },
  },
  hovermode: 'x unified',
})

export const PLOTLY_CONFIG = {
  displaylogo: false,
  modeBarButtonsToRemove: ['select2d', 'lasso2d', 'autoScale2d'],
  toImageButtonOptions: {
    format: 'png',
    scale: 2,
    filename: 'salesvision_chart',
  },
  responsive: true,
}
