/**
 * Returns the Supabase **publishable** (anon) key for client/server auth.
 * Never use the secret (service_role) key here — Supabase blocks it in browsers.
 */
export function getSupabasePublishableKey(): string {
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!key) {
    throw new Error(
      'Missing Supabase key. Set NEXT_PUBLIC_SUPABASE_ANON_KEY (publishable/anon key) in .env'
    );
  }

  if (key.startsWith('sb_secret_')) {
    throw new Error(
      'NEXT_PUBLIC_SUPABASE_ANON_KEY contains a secret key. Use the publishable (anon) key from Supabase → Project Settings → API.'
    );
  }

  return key;
}

export function getSupabaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL in .env');
  }
  return url;
}
