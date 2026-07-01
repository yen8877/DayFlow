/**
 * Supabase renamed "anon" to "publishable" for new projects.
 * Both keys have the same low-privilege role when RLS is enabled.
 */
export function getSupabaseUrl() {
  return process.env.NEXT_PUBLIC_SUPABASE_URL;
}

export function getSupabaseAnonKey() {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  );
}

export function hasSupabaseConfig() {
  return Boolean(getSupabaseUrl() && getSupabaseAnonKey());
}
