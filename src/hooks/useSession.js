import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

/** Retourne { user, loading } et suit les changements de session. */
export function useSession() {
  const [state, setState] = useState({ user: null, loading: true })

  useEffect(() => {
    let active = true
    // S'abonner avant la lecture initiale évite de manquer une connexion intervenant entre les deux.
    const { data: auth } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) setState({ user: session?.user ?? null, loading: false })
    })

    supabase.auth.getSession()
      .then(({ data, error }) => {
        if (error) throw error
        if (active) setState((current) => current.loading
          ? { user: data.session?.user ?? null, loading: false }
          : current)
      })
      .catch((error) => {
        console.error('Impossible de récupérer la session :', error)
        if (active) setState({ user: null, loading: false })
      })

    return () => {
      active = false
      auth.subscription.unsubscribe()
    }
  }, [])

  return state
}
