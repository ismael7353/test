import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { fetchShopBySlug } from '../api/shops'
import { bumpView } from '../api/extra'
import { followInfo, setFollow } from '../api/social'
import Avatar from '../components/Avatar'
import ContactLinks from '../components/ContactLinks'
import LiveBadge from '../components/LiveBadge'
import Reviews from '../components/Reviews'
import PageLoading from '../components/PageLoading'
import PostFeed from '../components/PostFeed'
import XmasBanner from '../components/XmasBanner'
import { useSession } from '../hooks/useSession'
import { isPro } from '../lib/format'

export default function ShopPage() {
  const { slug } = useParams()
  const nav = useNavigate()
  const { user } = useSession()
  const [shop, setShop] = useState(undefined)
  const [fol, setFol] = useState({ count: 0, mine: false })

  useEffect(() => {
    setShop(undefined)
    fetchShopBySlug(slug).then((s) => { setShop(s); if (s) { followInfo(s.id).then(setFol); bumpView(s.id) } }).catch(() => setShop(null))
  }, [slug, user])

  if (shop === undefined) return <PageLoading label="Chargement de la boutique…" />
  if (shop === null) return <div className="card pad">Boutique introuvable.</div>
  async function toggle() {
    if (!user) return nav('/login')
    const on = !fol.mine
    setFol((f) => ({ count: f.count + (on ? 1 : -1), mine: on }))
    try { await setFollow(shop.id, on) } catch { setFol((f) => ({ count: f.count + (on ? -1 : 1), mine: !on })) }
  }

  return (
    <>
      <div className="card shop-head">
        <div className="cover" style={shop.cover_url ? { backgroundImage: `url(${shop.cover_url})` } : undefined} />
        <div className="pad">
          <div className="row" style={{ alignItems: 'flex-end', marginTop: -44 }}>
            <Avatar url={shop.avatar_url} name={shop.name} size={84} />
            <div style={{ flex: 1 }} />
            <LiveBadge shop={shop} />
          </div>
          <h2 style={{ margin: '8px 0 0' }}>{shop.name}{isPro(shop) && <span className="tag" style={{ marginLeft: 8 }}>Pro</span>}{shop.verified && <span className="tag" style={{ marginLeft: 8 }}>Vérifié</span>}</h2>
          <div className="mu">{shop.city} · {fol.count} abonné{fol.count > 1 ? 's' : ''}</div>
          {shop.bio && <p>{shop.bio}</p>}
          <div className="grid">
            <button className={fol.mine ? '' : 'pri'} onClick={toggle}>{fol.mine ? 'Abonné' : 'S’abonner'}</button>
            <ContactLinks shop={shop} />
          </div>
        </div>
      </div>
      <Reviews shop={shop} user={user} />
      {shop.xmas && <XmasBanner text="commandez maintenant pour recevoir à temps." />}
      <PostFeed shopId={shop.id} />
    </>
  )
}
