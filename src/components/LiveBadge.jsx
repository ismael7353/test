export default function LiveBadge({ shop }) {
  if (!shop.is_live) return null
  return (
    <a className="live" href={shop.live_url || '#'} target="_blank" rel="noreferrer">● EN DIRECT</a>
  )
}
