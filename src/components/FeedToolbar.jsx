import { useEffect, useState } from 'react'
import { useDebounce } from '../hooks/useDebounce'
import { locate } from '../lib/geo'
import { CATEGORIES } from '../lib/categories'

const SORT_OPTIONS = [
  { value: 'recent', label: 'Plus récents' },
  { value: 'promo', label: 'Meilleures promos' },
  { value: 'near', label: 'Près de moi' },
  { value: 'price_asc', label: 'Prix croissant' },
  { value: 'price_desc', label: 'Prix décroissant' },
]

/** Recherche (avec délai), tri et filtre promo. `value` = { search, sort, promoOnly }. */
export default function FeedToolbar({ value, onChange }) {
  const [text, setText] = useState(value.search)
  const debounced = useDebounce(text, 400)

  useEffect(() => {
    if (debounced !== value.search) onChange({ ...value, search: debounced })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced])

  return (
    <div className="card pad toolbar">
      <input
        type="search"
        placeholder="Rechercher un produit…"
        aria-label="Rechercher un produit"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <div className="chips scroll">
        <button type="button" className={`chip${value.following ? '' : ' on'}`} onClick={() => onChange({ ...value, following: false })}>Pour vous</button>
        <button type="button" className={`chip${value.following ? ' on' : ''}`} onClick={() => onChange({ ...value, following: true })}>Abonnements</button>
        {[['all', 'Tout'], ...CATEGORIES].map(([k, l]) => (
          <button type="button" key={k} className={`chip${(value.category || 'all') === k ? ' on' : ''}`} onClick={() => onChange({ ...value, category: k })}>{l}</button>
        ))}
      </div>
      <div className="toolbar-row">
        <select
          aria-label="Trier"
          value={value.sort}
          onChange={async (e) => {
            const v = e.target.value
            if (v === 'near') { try { await locate() } catch { alert('Activez la localisation pour trier par proximité.'); return } }
            onChange({ ...value, sort: v })
          }}
        >
          {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <button
          type="button"
          className={value.promoOnly ? 'chip on' : 'chip'}
          aria-pressed={value.promoOnly}
          onClick={() => onChange({ ...value, promoOnly: !value.promoOnly })}
        >
          Promos
        </button>
      </div>
    </div>
  )
}
