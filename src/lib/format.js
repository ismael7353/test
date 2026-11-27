export const formatAr = (n) => `${Number(n).toLocaleString('fr-FR')} Ar`

export const finalPrice = (post) => (post.price * (100 - post.promo_percent)) / 100

export const digitsOnly = (s = '') => s.replace(/\D/g, '')

export const whatsappNumber = (number = '') => {
  const digits = digitsOnly(number)
  if (digits.startsWith('00')) return digits.slice(2)
  if (digits.startsWith('261')) return digits
  if (digits.startsWith('0')) return `261${digits.slice(1)}`
  if (digits.length === 9) return `261${digits}`
  return digits
}

export const whatsappLink = (number, text = '') =>
  `https://wa.me/${whatsappNumber(number)}${text ? `?text=${encodeURIComponent(text)}` : ''}`

export const facebookLink = (value = '') => {
  const candidate = (value || '').trim()
  if (!candidate) return ''
  try {
    const url = new URL(candidate)
    const host = url.hostname.toLowerCase()
    const isFacebookHost = ['facebook.com', 'fb.com', 'fb.me']
      .some((domain) => host === domain || host.endsWith(`.${domain}`))
    if (!isFacebookHost || !['http:', 'https:'].includes(url.protocol)) return ''
    url.protocol = 'https:'
    return url.toString()
  } catch {
    return ''
  }
}

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
