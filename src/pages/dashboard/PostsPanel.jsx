import { useState } from 'react'
import { Link } from 'react-router-dom'
import { deletePost, fetchPosts, setPostPublished } from '../../api/posts'
import Pagination from '../../components/Pagination'
import { usePaginated } from '../../hooks/usePaginated'
import useRelativeTime from '../../hooks/useRelativeTime'
import { formatAr, isPro } from '../../lib/format'
import Icon from '../../components/Icon'

function PublicationRow({ post, pro, busyId, onToggle, onRemove }) {
  const publishedAt = useRelativeTime(post.created_at)

  return (
    <article className="seller-product" key={post.id}>
      <Link to={`/post/${post.id}`} className="seller-product-image" aria-label={`Voir ${post.title}`}>
        {post.image_url ? <img src={post.image_url} alt="" loading="lazy" /> : <span aria-hidden="true">V</span>}
      </Link>
      <div className="seller-product-body">
        <div className="seller-product-heading">
          <div>
            <Link className="seller-product-title" to={`/post/${post.id}`}>{post.title}</Link>
            <div className="seller-product-meta">
              <span>{formatAr(post.price)}</span>
              <span aria-hidden="true">·</span>
              <span>{post.stock > 0 ? `${post.stock} en stock` : 'Épuisé'}</span>
              <span aria-hidden="true">·</span>
              <time dateTime={post.created_at}>{publishedAt}</time>
            </div>
          </div>
          <span className={`tag ${post.is_published ? '' : 'off'}`}>
            {post.is_published ? 'En ligne' : 'Brouillon'}
          </span>
        </div>
        <div className="seller-product-badges">
          {pro && post.is_published && <span className="seller-featured-badge"><Icon name="sparkle" size={13} /> Éligible à la une</span>}
          {post.promo_percent > 0 && <span className="tag">−{post.promo_percent}%</span>}
        </div>
        <div className="seller-product-actions">
          <Link className="btn" to={`/publish/${post.id}`}>Modifier</Link>
          <button disabled={busyId === post.id} onClick={() => onToggle(post)}>
            {busyId === post.id ? 'Mise à jour…' : post.is_published ? 'Masquer' : 'Publier'}
          </button>
          <button className="seller-delete" disabled={busyId === post.id} onClick={() => onRemove(post.id)}>Supprimer</button>
        </div>
      </div>
    </article>
  )
}

export default function PostsPanel({ shop }) {
  const { items, total, page, setPage, reload, loading, error } = usePaginated(
    (p) => fetchPosts({ page: p, shopId: shop.id, onlyPublished: false }),
    [shop.id]
  )
  const [busyId, setBusyId] = useState('')
  const [actionError, setActionError] = useState('')
  const pro = isPro(shop)

  async function togglePublished(post) {
    setBusyId(post.id)
    setActionError('')
    try {
      await setPostPublished(post.id, !post.is_published)
      await reload()
    } catch (error) {
      setActionError(error.message || 'Impossible de modifier la visibilité.')
    } finally {
      setBusyId('')
    }
  }

  async function remove(id) {
    if (!window.confirm('Supprimer cette publication ?')) return
    setBusyId(id)
    setActionError('')
    try {
      await deletePost(id)
      await reload()
    } catch (error) {
      setActionError(error.message || 'Impossible de supprimer cette publication.')
    } finally {
      setBusyId('')
    }
  }

  return (
    <div className="card seller-panel">
      <div className="seller-panel-heading">
        <div>
          <span className="eyebrow">CATALOGUE</span>
          <h2>Vos publications <span className="seller-count">{total}</span></h2>
          <p className="mu">{pro ? 'Présentez tout votre catalogue avec Pro.' : 'La formule gratuite permet jusqu’à 5 produits visibles.'}</p>
        </div>
        <Link className="btn pri" to="/publish">＋ Ajouter</Link>
      </div>

      {pro && <div className="seller-featured-note"><Icon name="sparkle" size={18} /><p><b>La sélection « À la une »</b><br />Les 8 publications Pro les plus récentes peuvent être mises en avant sur l’accueil. Gardez vos produits à jour pour augmenter leurs chances d’y apparaître.</p></div>}
      {actionError && <p className="seller-action-error" role="alert">{actionError}</p>}
      {error && <div className="seller-empty" role="alert"><p className="error">{error.message || 'Impossible de charger vos publications.'}</p><button onClick={reload}>Réessayer</button></div>}
      {loading && items.length === 0 && <div className="seller-empty" role="status"><span className="spinner" />Chargement de vos publications…</div>}
      {!loading && !error && items.length === 0 && <div className="seller-empty"><span aria-hidden="true">◇</span><b>Votre catalogue commence ici</b><p className="mu">Ajoutez un produit avec une belle photo, un prix clair et le stock disponible.</p><Link className="btn pri" to="/publish">Créer ma première publication</Link></div>}
      {items.map((post) => <PublicationRow key={post.id} post={post} pro={pro} busyId={busyId} onToggle={togglePublished} onRemove={remove} />)}
      <Pagination page={page} total={total} onChange={setPage} />
    </div>
  )
}
