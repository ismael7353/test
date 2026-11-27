import { useCallback, useEffect, useState } from 'react'

/** Retourne une fonction d'installation si le navigateur propose d'installer la PWA, sinon null. */
export function useInstall() {
  const [ev, setEv] = useState(null)
  const [installed, setInstalled] = useState(() =>
    window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true
  )
  const [showHint, setShowHint] = useState(false)
  const [nextHintAt, setNextHintAt] = useState(readNextHintAt)

  const dismissHint = useCallback(() => {
    const next = Date.now() + 7 * 24 * 60 * 60 * 1000
    setShowHint(false)
    setNextHintAt(next)
    saveHintSchedule(next)
  }, [])

  useEffect(() => {
    const handleInstallPrompt = (event) => {
      event.preventDefault()
      if (!isInstalled()) setEv(event)
    }
    const handleInstalled = () => {
      setInstalled(true)
      setEv(null)
      setShowHint(false)
      clearHintSchedule()
    }

    addEventListener('beforeinstallprompt', handleInstallPrompt)
    addEventListener('appinstalled', handleInstalled)
    return () => {
      removeEventListener('beforeinstallprompt', handleInstallPrompt)
      removeEventListener('appinstalled', handleInstalled)
    }
  }, [])

  useEffect(() => {
    if (!ev || installed) return undefined
    const timer = setTimeout(() => setShowHint(true), Math.max(0, nextHintAt - Date.now()))
    return () => clearTimeout(timer)
  }, [ev, installed, nextHintAt])

  useEffect(() => {
    if (!showHint) return undefined
    const timer = setTimeout(dismissHint, 15000)
    return () => clearTimeout(timer)
  }, [showHint, dismissHint])

  const install = useCallback(async () => {
    if (!ev) return
    await ev.prompt()
    const { outcome } = await ev.userChoice
    setEv(null)
    if (outcome === 'accepted') {
      setInstalled(true)
      clearHintSchedule()
    } else {
      dismissHint()
    }
  }, [dismissHint, ev])

  return {
    install: ev && !installed ? install : null,
    showHint: showHint && !installed,
    dismissHint,
  }
}

const INSTALL_HINT_KEY = 'vendeo:pwa-install-hint-at'

function isInstalled() {
  return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true
}

function readNextHintAt() {
  try {
    const saved = Number(localStorage.getItem(INSTALL_HINT_KEY))
    if (saved > 0) return saved
    const first = Date.now() + 10000
    localStorage.setItem(INSTALL_HINT_KEY, String(first))
    return first
  } catch (error) {
    console.error('Impossible de mémoriser le rappel d’installation :', error)
    return Date.now() + 10000
  }
}

function saveHintSchedule(timestamp) {
  try {
    localStorage.setItem(INSTALL_HINT_KEY, String(timestamp))
  } catch (error) {
    console.error('Impossible de mémoriser le rappel d’installation :', error)
  }
}

function clearHintSchedule() {
  try {
    localStorage.removeItem(INSTALL_HINT_KEY)
  } catch (error) {
    console.error('Impossible de supprimer le rappel d’installation :', error)
  }
}
