import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { searchShops, suggestTitles } from '../api/search'
import { useDebounce } from '../hooks/useDebounce'
import { CATEGORIES } from '../lib/categories'
import { addRecent, clearRecent, getRecent, removeRecent } from '../lib/searchHistory'
import Avatar from './Avatar'
import Icon from './Icon'

/** Barre de recherche façon réseau social : historique, suggestions, boutiques, effacer, Entrée. */
export default function SearchBox({ value, onSearch, onCategory }) {
  const [text, setText] = useState(value)
  const [open, setOpen] = useState(false)
  const [recent, setRecent] = useState(getRecent)
  const [titles, setTitles] = useState([])
  const [shops, setShops] = useState([])
  const [active, setActive] = useState(-1)
  const box = useRef(null)
  const debounced = useDebounce(text, 250)

  // Résultats en direct dans le fil, après une courte pause.
  useEffect(() => { if (debounced.trim() !== value) onSearch(debounced.trim()) /* eslint-disable-line */ }, [debounced])

  useEffect(() => {
    let live = true
    if (debounced.trim().length < 2) { setTitles([]); setShops([]); return }
    Promise.all([suggestTitles(debounced), searchShops(debounced, 3)])
      .then(([t, s]) => { if (live) { setTitles(t); setShops(s) } })
      .catch(() => {})
    return () => { live = false }
  }, [debounced])

  useEffect(() => {
    const close = (e) => { if (!box.current?.contains(e.target)) setOpen(false) }
    document.addEventListener('pointerdown', close)
    return () => document.removeEventListener('pointerdown', close)
  }, [])

  const typing = text.trim().length >= 2
  const rows = typing ? titles.map((t) => t.title) : recent

  function submit(term) {
    const t = term.trim()
    setText(t); setOpen(false); setActive(-1)
    onSearch(t)
    if (t) setRecent(addRecent(t))
  }
  function clear() { setText(''); onSearch(''); setTitles([]); setShops([]) }

  function onKeyDown(e) {
    if (e.key === 'ArrowDown') { e.preventDefault(); setOpen(true); setActive((i) => Math.min(i + 1, rows.length - 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((i) => Math.max(i - 1, -1)) }
    else if (e.key === 'Escape') { setOpen(false); e.currentTarget.blur() }
    else if (e.key === 'Enter') { e.preventDefault(); submit(active >= 0 ? rows[active] : text) }
  }

  return (
    <div className="sb" ref={box}>
      <label className="ft-search">
        <Icon name="search" size={18} />
        <input
          type="search"
          enterKeyHint="search"
          autoComplete="off"
          placeholder="Rechercher produits, boutiques…"
          aria-label="Rechercher un produit ou une boutique"
          aria-expanded={open}
          value={text}
          onFocus={() => { setRecent(getRecent()); setOpen(true) }}
          onChange={(e) => { setText(e.target.value); setActive(-1); setOpen(true) }}
          onKeyDown={onKeyDown}
        />
        {text && <button type="button" className="sb-clear" aria-label="Effacer" onMouseDown={(e) => e.preventDefault()} onClick={clear}><Icon name="close" size={16} /></button>}
      </label>

      {open && (
        <div className="sb-pop" role="listbox">
          {!typing && recent.length > 0 && (
            <div className="sb-head"><b>Récents</b><button type="button" onClick={() => setRecent(clearRecent())}>Tout effacer</button></div>
          )}
          {rows.map((r, i) => (
            <div key={r} className={`sb-row${i === active ? ' on' : ''}`} role="option" aria-selected={i === active}>
              <button type="button" className="sb-main" onClick={() => submit(r)}>
                <Icon name="search" size={16} /><span>{r}</span>
              </button>
              {!typing && <button type="button" className="sb-x" aria-label={`Supprimer ${r}`} onClick={() => setRecent(removeRecent(r))}><Icon name="close" size={14} /></button>}
            </div>
          ))}
          {typing && shops.length > 0 && <div className="sb-head"><b>Boutiques</b></div>}
          {typing && shops.map((s) => (
            <Link key={s.id} to={`/shop/${s.slug}`} className="sb-shop" onClick={() => { setOpen(false); setRecent(addRecent(text)) }}>
              <Avatar url={s.avatar_url} name={s.name} size={30} />
              <span><b>{s.name}{s.verified && ' ✓'}</b><small>{s.city || `@${s.slug}`}</small></span>
            </Link>
          ))}
          {typing && !titles.length && !shops.length && <p className="sb-empty">Aucun résultat pour « {text.trim()} »</p>}
          {!typing && (
            <>
              <div className="sb-head"><b>Catégories populaires</b></div>
              <div className="sb-cats">
                {CATEGORIES.slice(0, 6).map(([k, l]) => (
                  <button type="button" key={k} className="chip" onClick={() => { onCategory?.(k); setOpen(false) }}>{l}</button>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
