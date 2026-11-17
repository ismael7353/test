import { daysUntilChristmas } from '../lib/format'

export default function XmasBanner({ text = 'trouvez vos cadeaux et votre menu de réveillon.' }) {
  const days = daysUntilChristmas()
  if (days === 0) return null
  return (
    <div className="xmas">Noël dans {days} jour{days > 1 ? 's' : ''} : {text}</div>
  )
}
