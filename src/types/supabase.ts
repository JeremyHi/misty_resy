import { User } from '@supabase/supabase-js'

declare module '@supabase/supabase-js' {
    interface User {
        is_admin: boolean
    }
}
