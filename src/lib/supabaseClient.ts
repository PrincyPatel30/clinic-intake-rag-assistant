/**
 * Supabase connection.
 *
 * Runtime only ever READS the corpus, so the app connects with the publishable
 * key. Row Level Security is on, with a select-only policy — there is no
 * service-role secret deployed to Vercel at all. Ingest (the only writer) runs
 * separately, from a trusted machine.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!client) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_PUBLISHABLE_KEY;

    if (!url || !key) {
      throw new Error(
        'SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY must be set. ' +
          'Copy .env.example to .env.local and fill them in.'
      );
    }

    client = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return client;
}

/** True when the app has enough configuration to reach the database at all. */
export function isSupabaseConfigured(): boolean {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_PUBLISHABLE_KEY);
}
