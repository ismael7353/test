import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchFeatured } from '../api/posts'
import { finalPrice, formatAr } from '../lib/format'
import Icon from './Icon'

/** « À la une » : publications des boutiques Pro. */
export default function Featured() {
  const [list, setList] = useState([])
  useEffect(() => { fetchFeatured().then(setList).catch(() => {}) }, [])
  if (!list.length) return null
  return (
    <section className="featured">
      <h3 className="side-title">À la une</h3>
      <div className="chips scroll">
        {list.map((p) => (
          <Link key={p.id} to={`/post/${p.id}`} className="card feat">
            {p.image_url ? <img src={p.image_url} alt="" loading="lazy" /> : <div className="feat-ph" />}
            <div className="pad"><span className="feat-badge"><Icon name="sparkle" size={13} /> Pro · À la une</span><b className="clamp" style={{ WebkitLineClamp: 1 }}>{p.title}</b><div className="mu">{p.shop.name}</div><b>{formatAr(finalPrice(p))}</b></div>
          </Link>
        ))}
      </div>
    </section>
  )
}
