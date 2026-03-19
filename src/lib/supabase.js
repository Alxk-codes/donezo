import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://betsqexkpcxovwlgtqhw.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_cWK9X5dVrTb0h-MzKOjIUg_xbDTJuPt'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      detectSessionInUrl: true,
      persistSession: true,
      autoRefreshToken: true,
      flowType: 'implicit',
    }
});