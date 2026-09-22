import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '[Supabase Config] VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY / VITE_SUPABASE_PUBLISHABLE_KEY no están definidas en tu archivo .env local.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
