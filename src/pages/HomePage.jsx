import { useState } from 'react'
import { Link } from 'react-router-dom'
import FeedToolbar from '../components/FeedToolbar'
import LiveShops from '../components/LiveShops'
import PostFeed from '../components/PostFeed'
import Featured from '../components/Featured'
import Stories from '../components/Stories'
import XmasBanner from '../components/XmasBanner'
import Icon from '../components/Icon'

const DEFAULT_FILTERS = { search: '', sort: 'recent', promoOnly: false, category: 'all', following: false }

export default function HomePage() {
  const [filters, setFilters] = useState(DEFAULT_FILTERS)

  return (
    <div className="home">
      {/* Placée avant dans le DOM : en haut sur mobile, à droite sur ordinateur (voir app.css) */}
      <aside className="home-aside">
        <LiveShops />
      </aside>

      <section className="home-main">
        <Stories />
        <div className="hero">
          <b>Tonga soa sur Vendeo.</b>
          <span>Découvrez des boutiques, des produits et des vendeurs près de chez vous.</span>
          <div className="seller-invite">
            <div><b>Vous vendez sur Facebook ou TikTok ?</b><small>Créez votre boutique Vendeo gratuitement et rassemblez vos produits au même endroit.</small></div>
            <Link className="btn pri" to="/dashboard">Ouvrir ma boutique</Link>
          </div>
          <div className="chips">
            {['Analakely', 'Isotry', 'Ankorondrano', 'Behoririka', '67 Ha', 'Ivandry'].map((z) => (
              <Link key={z} className="chip" to={`/map?q=${encodeURIComponent(z)}`}><Icon name="pin" size={14} /> {z}</Link>
            ))}
          </div>
        </div>
        <Featured />
        <XmasBanner />
        <FeedToolbar value={filters} onChange={setFilters} />
        <PostFeed filters={filters} />
      </section>
    </div>
  )
}
