import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient() {
  const cookieStore = await cookies();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const resolvedUrl = !url || !anonKey || url.includes('your-project-url') 
    ? 'https://placeholder-project.supabase.co' 
    : url;
  const resolvedAnonKey = !url || !anonKey || url.includes('your-project-url') 
    ? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder' 
    : anonKey;

  return createServerClient(
    resolvedUrl,
    resolvedAnonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Can be ignored if called from Server Component
          }
        },
      },
    }
  );
}
