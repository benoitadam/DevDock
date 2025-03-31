import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY!

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

export type Supabase = typeof supabase

fetch(`${SUPABASE_URL}/rest/v1/assets?select=*&parent_id=is.null`, {
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
    }
  })
  .then(response => response.json())
  .then(data => console.log('supa data', data))
  .catch(error => console.error('supa erreur:', error))