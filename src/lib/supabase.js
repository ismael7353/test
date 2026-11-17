import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !key) {
  throw new Error(
    'Variables manquantes : créez frontend/.env avec VITE_SUPABASE_URL et VITE_SUPABASE_PUBLISHABLE_KEY, puis relancez npm run dev.'
  )
}

export const supabase = createClient(url, key)
