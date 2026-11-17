export const formatAr = (n) => `${Number(n).toLocaleString('fr-FR')} Ar`

export const finalPrice = (post) => (post.price * (100 - post.promo_percent)) / 100

export const digitsOnly = (s = '') => s.replace(/\D/g, '')

export const whatsappLink = (number, text = '') =>
  `https://wa.me/${digitsOnly(number)}${text ? `?text=${encodeURIComponent(text)}` : ''}`

export function formatRelativeTime(value, now = Date.now()) {
  const timestamp = new Date(value).getTime()
  if (!Number.isFinite(timestamp)) return ''

  const elapsed = (timestamp - now) / 1000
  if (Math.abs(elapsed) < 45) return 'à l’instant'

  const formatter = new Intl.RelativeTimeFormat('fr-FR', { numeric: 'auto' })
  const seconds = Math.abs(elapsed)
  if (seconds < 3600) return formatter.format(Math.round(elapsed / 60), 'minute')
  if (seconds < 86400) return formatter.format(Math.round(elapsed / 3600), 'hour')
  if (seconds < 7 * 86400) return formatter.format(Math.round(elapsed / 86400), 'day')
  return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' }).format(timestamp)
}

export function daysUntilChristmas(now = new Date()) {
  const christmas = new Date(now.getFullYear(), 11, 25)
  return Math.max(0, Math.ceil((christmas - now) / 86_400_000))
}
export const isPro = (s) => s?.plan === 'pro' && new Date(s.plan_until) > new Date()
