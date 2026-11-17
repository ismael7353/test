import { useCallback, useEffect, useRef, useState } from 'react'

/** Défilement infini : fetcher(page) -> { items, total }. Charge la page suivante quand `sentinel` approche de l'écran. */
export function useInfinite(fetcher, deps = []) {
  const key = JSON.stringify(deps)
  const [st, setSt] = useState({ items: [], done: false, loading: true, error: null })
  const page = useRef(0), busy = useRef(false), gen = useRef(0), sentinel = useRef(null)

  const load = useCallback(async () => {
    if (busy.current) return
    busy.current = true
    const g = gen.current
    setSt((s) => ({ ...s, loading: true, error: null }))
    try {
      const { items, total } = await fetcher(page.current)
      if (g !== gen.current) return
      page.current += 1
      setSt((s) => { const all = [...s.items, ...items]; return { items: all, done: !items.length || all.length >= total, loading: false, error: null } })
    } catch (error) {
      if (g === gen.current) setSt((s) => ({ ...s, loading: false, error }))
    } finally {
      if (g === gen.current) busy.current = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  const reload = useCallback(() => {
    gen.current++; page.current = 0; busy.current = false
    setSt({ items: [], done: false, loading: true, error: null })
    load()
  }, [load])

  useEffect(() => { reload() }, [reload])
  useEffect(() => {
    const el = sentinel.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => e.isIntersecting && !st.done && !st.loading && !st.error && load(), { rootMargin: '700px' })
    io.observe(el)
    return () => io.disconnect()
  })
  return { ...st, sentinel, reload }
}
