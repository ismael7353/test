import { fetchPosts } from '../api/posts'
import { useInfinite } from '../hooks/useInfinite'
import PostCard from './PostCard'
import PostSkeleton from './PostSkeleton'

/** Fil de publications à défilement infini (général, ou filtré sur une boutique). */
export default function PostFeed({ shopId, filters = {} }) {
  const { search = '', sort = 'recent', promoOnly = false, category = 'all', following = false } = filters
  const { items, done, loading, error, sentinel, reload } = useInfinite(
    (p) => fetchPosts({ page: p, shopId, search, sort, promoOnly, category, following }),
    [shopId, search, sort, promoOnly, category, following]
  )

  if (!loading && !error && items.length === 0) {
    return (
      <div className="card pad empty">
        <b>{search || promoOnly ? 'Aucun résultat' : 'Aucune publication pour le moment'}</b>
        <p className="mu">{following ? 'Abonnez-vous à des boutiques pour remplir ce fil.' : search || promoOnly ? 'Essayez un autre mot ou retirez les filtres.' : 'Revenez bientôt, les vendeurs publient chaque jour.'}</p>
      </div>
    )
  }
  return (
    <>
      {items.map((post) => <PostCard key={post.id} post={post} onOrdered={reload} />)}
      {loading && [1, 2].map((n) => <PostSkeleton key={n} />)}
      {error && <div className="card pad"><p className="error">Chargement impossible.</p><button onClick={reload}>Réessayer</button></div>}
      {!done && !error && <div ref={sentinel} style={{ height: 1 }} />}
      {done && items.length > 0 && <p className="mu" style={{ textAlign: 'center' }}>Vous avez tout vu.</p>}
    </>
  )
}
