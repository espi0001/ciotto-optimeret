// Importér Supabase client-fabrik-funktion med alias
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Asynkron funktion der opretter og returnerer en Supabase-klient
export const createClient = async () => {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL, // Supabase URL fra env
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY // Supabase anon key fra env
  );
};
