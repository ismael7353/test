import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Pagination générique. fetcher(page) doit retourner { items, total }.
 * - Quand `deps` change : retour à la page 0.
 * - Les pages déjà vues sont gardées en mémoire (revenir en arrière ne consomme pas de données).
 * - reload() vide le cache et recharge la page courante.
 */
export function usePaginated(fetcher, deps = []) {
  const key = JSON.stringify(deps)
  const cache = useRef(new Map())
  const [page, setPage] = useState(0)
  const [state, setState] = useState({ items: [], total: 0, loading: true, error: null })

  const load = useCallback(async (force = false) => {
    const cacheKey = `${key}:${page}`
    if (!force && cache.current.has(cacheKey)) {
      setState({ ...cache.current.get(cacheKey), loading: false, error: null })
      return
    }
    setState((s) => ({ ...s, loading: true }))
    try {
      const result = await fetcher(page)
      cache.current.set(cacheKey, result)
      setState({ ...result, loading: false, error: null })
    } catch (error) {
      setState((s) => ({ ...s, loading: false, error }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, key])

  useEffect(() => { setPage(0) }, [key])
  useEffect(() => { load() }, [load])

  const reload = () => { cache.current.clear(); return load(true) }

  return { ...state, page, setPage, reload }
}
