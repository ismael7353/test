import { useEffect, useState } from 'react'
import { unreadCount } from '../api/extra'
import { supabase } from '../lib/supabase'

/** Nombre de notifications non lues, mis à jour en temps réel. */
export function useUnread(user) {
  const [n, setN] = useState(0)
  useEffect(() => {
    if (!user) { setN(0); return }
    const load = () => unreadCount().then(setN).catch(() => {})
    load()
    const ch = supabase.channel(`notif-${user.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` }, load).subscribe()
    return () => supabase.removeChannel(ch)
  }, [user])
  return n
}
