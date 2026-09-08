import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createSessionClient() {
  const store = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: {
      getAll: () => store.getAll(),
      // Proxy refreshes cookies before Server Components render.
      setAll: () => {},
    } },
  )
}
