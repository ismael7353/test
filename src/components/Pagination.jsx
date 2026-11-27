import { PAGE_SIZE } from '../api/pagination'

export default function Pagination({ page, total, onChange }) {
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  if (pages < 2) return null

  const go = (p) => { onChange(p); window.scrollTo({ top: 0 }) }

  return (
    <div className="pager">
      <button disabled={page === 0} onClick={() => go(page - 1)}>Précédent</button>
      <span className="mu">Page {page + 1} sur {pages}</span>
      <button disabled={page + 1 >= pages} onClick={() => go(page + 1)}>Suivant</button>
    </div>
  )
}
