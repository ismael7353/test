import { useEffect, useState } from 'react'

/** Retourne une fonction d'installation si le navigateur propose d'installer la PWA, sinon null. */
export function useInstall() {
  const [ev, setEv] = useState(null)
  useEffect(() => {
    const h = (e) => { e.preventDefault(); setEv(e) }
    addEventListener('beforeinstallprompt', h)
    return () => removeEventListener('beforeinstallprompt', h)
  }, [])
  return ev ? async () => { ev.prompt(); await ev.userChoice; setEv(null) } : null
}
