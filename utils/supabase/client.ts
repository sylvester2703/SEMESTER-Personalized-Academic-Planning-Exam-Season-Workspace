import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://rqopkdzujnsdejlxudka.supabase.co";
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "sb_publishable_TzdmEGcECq_rn-NHEENL_g_RUGZE0Ea";

export const createClient = () => {
  return createBrowserClient(supabaseUrl, supabaseKey);
};
