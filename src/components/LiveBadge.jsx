export default function LiveBadge({ shop }) {
  if (!shop.is_live) return null
  let liveUrl = null
  if (shop.live_url?.trim()) {
    try {
      const value = shop.live_url.trim()
      const hasScheme = /^[a-z][a-z\d+.-]*:/i.test(value)
      const url = new URL(hasScheme ? value : `https://${value}`)
      if (url.protocol === 'https:' || url.protocol === 'http:') liveUrl = url.href
    } catch {
      liveUrl = null
    }
  }

  return (
    liveUrl
      ? <a className="live" href={liveUrl} target="_blank" rel="noopener noreferrer">En direct</a>
      : <span className="live">En direct</span>
  )
}
