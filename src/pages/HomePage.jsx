import { useState } from 'react'
import FeedToolbar from '../components/FeedToolbar'
import LiveShops from '../components/LiveShops'
import PostFeed from '../components/PostFeed'
import Featured from '../components/Featured'
import ShopResults from '../components/ShopResults'
import Stories from '../components/Stories'

const DEFAULT_FILTERS = { search: '', sort: 'recent', promoOnly: false, category: 'all', following: false }

export default function HomePage() {
  const [filters, setFilters] = useState(DEFAULT_FILTERS)

  return (
    <div className="home">
      {/* Placée avant dans le DOM : en haut sur mobile, à droite sur ordinateur (voir home.css) */}
      <aside className="home-aside">
        <LiveShops />
      </aside>

      <section className="home-main">
        <Stories />
        <FeedToolbar value={filters} onChange={setFilters} />
        {filters.search ? <ShopResults query={filters.search} /> : <Featured />}
        <PostFeed filters={filters} />
      </section>
    </div>
  )
}
