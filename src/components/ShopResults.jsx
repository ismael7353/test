import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { searchShops } from '../api/search'
import Avatar from './Avatar'

/** Boutiques correspondant à la recherche, affichées au-dessus des publications. */
export default function ShopResults({ query }) {
  const [shops, setShops] = useState([])
  useEffect(() => {
    let live = true
    searchShops(query, 6).then((s) => { if (live) setShops(s) }).catch(() => { if (live) setShops([]) })
    return () => { live = false }
  }, [query])
  if (!shops.length) return null
  return (
    <div className="sr" aria-label="Boutiques">
      <b>Boutiques</b>
      <div className="sr-row">
        {shops.map((s) => (
          <Link key={s.id} to={`/shop/${s.slug}`} className="sr-card">
            <Avatar url={s.avatar_url} name={s.name} size={48} />
            <span>{s.name}{s.verified && ' ✓'}</span>
            <small>{s.city || `@${s.slug}`}</small>
          </Link>
        ))}
      </div>
    </div>
  )
}
