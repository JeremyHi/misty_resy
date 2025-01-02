import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database.types'

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) throw new Error('Missing Supabase URL')
if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) throw new Error('Missing Supabase key')

export const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)
