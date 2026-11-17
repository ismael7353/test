import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchLiveShops } from '../api/shops'

/** Boutiques en direct : bande horizontale sur mobile, liste dans la colonne de droite sur ordinateur. */
export default function LiveShops() {
  const [shops, setShops] = useState([])
  useEffect(() => { fetchLiveShops().then(setShops).catch(() => setShops([])) }, [])

  if (shops.length === 0) return null
  return (
    <section className="card pad" aria-label="Boutiques en direct">
      <h3 className="side-title"><span className="live">● EN DIRECT</span> maintenant</h3>
      <ul className="live-list">
        {shops.map((s) => (
          <li key={s.id}>
            <Link to={`/shop/${s.slug}`} className="live-item">
              <span className="av">{s.name[0]}</span>
              <span>
                <b>{s.name}</b>
                <span className="mu" style={{ display: 'block' }}>{s.city || 'Madagascar'}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
