import { useEffect, useState } from 'react'

const KEY = 'vendeo-theme'
const initial = () => {
  try { const s = localStorage.getItem(KEY); if (s) return s } catch { /* ignore */ }
  return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

/** Thème clair/sombre mémorisé ; suit le réglage du téléphone au premier lancement. */
export function useTheme() {
  const [theme, setTheme] = useState(initial)
  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document.querySelector('meta[name=theme-color]')?.setAttribute('content', theme === 'dark' ? '#18191a' : '#0f9d6b')
    try { localStorage.setItem(KEY, theme) } catch { /* ignore */ }
  }, [theme])
  return [theme, () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))]
}
