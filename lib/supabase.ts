
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export const fmt = new Intl.NumberFormat(process.env.NEXT_PUBLIC_LOCALE || 'en-PH', {
  style: 'currency',
  currency: process.env.NEXT_PUBLIC_CURRENCY || 'PHP'
});
