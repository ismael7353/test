import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

const STORAGE_KEY = 'vendeo-cookie-consent-v1'

function readChoice() {
  try {
    const choice = localStorage.getItem(STORAGE_KEY)
    return choice === 'all' || choice === 'essential' ? choice : null
  } catch (error) {
    console.error('Impossible de lire le choix des cookies :', error)
    return null
  }
}

export default function CookieConsent({ forceOpen, onClose }) {
  const [choice, setChoice] = useState(readChoice)
  const [open, setOpen] = useState(() => choice === null)

  useEffect(() => {
    if (forceOpen) setOpen(true)
  }, [forceOpen])

  function saveChoice(value) {
    try {
      localStorage.setItem(STORAGE_KEY, value)
    } catch (error) {
      console.error('Impossible de mémoriser le choix des cookies :', error)
    }
    setChoice(value)
    setOpen(false)
    onClose()
  }

  if (!open) return null

  return (
    <aside className="cookie-consent" role="region" aria-label="Choix des cookies" aria-live="polite">
      <div className="cookie-copy">
        <strong>Votre confidentialité compte</strong>
        <p>Vendeo utilise le stockage nécessaire au fonctionnement de votre compte et à vos préférences. Aucun outil publicitaire ou de mesure d’audience n’est actuellement activé. Vous pouvez accepter ou refuser les usages non essentiels.</p>
        <Link to="/confidentialite">En savoir plus dans notre politique de confidentialité</Link>
      </div>
      <div className="cookie-actions">
        <button type="button" onClick={() => saveChoice('essential')}>Refuser le non essentiel</button>
        <button type="button" className="pri" onClick={() => saveChoice('all')}>Tout accepter</button>
      </div>
    </aside>
  )
}
