import { useState, useEffect } from 'react'

export function useDarkMode() {
  const [dark, setDark] = useState(() => {
    try {
      const val = localStorage.getItem('sv-dark')
      return val !== 'false'
    } catch {
      return true
    }
  })

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    try { localStorage.setItem('sv-dark', String(dark)) } catch {}
  }, [dark])

  return { dark, toggle: () => setDark(d => !d), setDark }
}
