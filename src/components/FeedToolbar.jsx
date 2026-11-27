import SearchBox from './SearchBox'
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
  return (
    <div className="ft">
      <div className="ft-top">
        <SearchBox
          value={value.search}
          onSearch={(search) => onChange({ ...value, search })}
          onCategory={(category) => onChange({ ...value, category })}
        />
        <select
          className="ft-sort"
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
      </div>
      <div className="ft-chips" role="group" aria-label="Filtres">
        <button type="button" className={`chip${value.following ? '' : ' on'}`} aria-pressed={!value.following} onClick={() => onChange({ ...value, following: false })}>Pour vous</button>
        <button type="button" className={`chip${value.following ? ' on' : ''}`} aria-pressed={!!value.following} onClick={() => onChange({ ...value, following: true })}>Abonnements</button>
        <button type="button" className={`chip${value.promoOnly ? ' on' : ''}`} aria-pressed={value.promoOnly} onClick={() => onChange({ ...value, promoOnly: !value.promoOnly })}>Promos</button>
        <span className="ft-sep" aria-hidden="true" />
        {[['all', 'Tout'], ...CATEGORIES].map(([k, l]) => (
          <button type="button" key={k} className={`chip${(value.category || 'all') === k ? ' on' : ''}`} aria-pressed={(value.category || 'all') === k} onClick={() => onChange({ ...value, category: k })}>{l}</button>
        ))}
      </div>
    </div>
  )
}
