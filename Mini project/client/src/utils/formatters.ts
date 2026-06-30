export const formatCurrency = (val: number): string => {
  if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(2)}M`
  if (val >= 1_000) return `$${(val / 1_000).toFixed(1)}K`
  return `$${val.toFixed(2)}`
}

export const formatNumber = (val: number): string => {
  if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(2)}M`
  if (val >= 1_000) return `${(val / 1_000).toFixed(1)}K`
  return val.toLocaleString()
}

export const formatPct = (val: number): string => `${val > 0 ? '+' : ''}${val.toFixed(1)}%`

export const formatDate = (dateStr: string): string => {
  try {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  } catch {
    return dateStr
  }
}

export const formatBytes = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export const truncate = (str: string, n = 24): string =>
  str.length > n ? str.slice(0, n) + '…' : str

export const dtypeLabel = (dtype: string): string => {
  if (dtype.includes('int') || dtype.includes('float')) return 'Number'
  if (dtype.includes('datetime')) return 'Date'
  if (dtype === 'object') return 'Text'
  if (dtype === 'bool') return 'Boolean'
  return dtype
}

export const dtypeColor = (dtype: string): string => {
  if (dtype.includes('int') || dtype.includes('float')) return 'badge-blue'
  if (dtype.includes('datetime')) return 'badge-green'
  if (dtype === 'object') return 'badge-gray'
  return 'badge-amber'
}
