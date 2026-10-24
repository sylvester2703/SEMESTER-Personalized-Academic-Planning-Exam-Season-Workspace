import { createClient as createSupabaseClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://rqopkdzujnsdejlxudka.supabase.co";
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "sb_publishable_TzdmEGcECq_rn-NHEENL_g_RUGZE0Ea";

// Custom browser storage adapter that uses sessionStorage so sessions automatically
// terminate the moment the student closes their browser/tab.
const customSessionStorage = {
  getItem: (key: string): string | null => {
    if (typeof window === "undefined") return null;
    try {
      return window.sessionStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem: (key: string, value: string): void => {
    if (typeof window === "undefined") return;
    try {
      window.sessionStorage.setItem(key, value);
    } catch {}
  },
  removeItem: (key: string): void => {
    if (typeof window === "undefined") return;
    try {
      window.sessionStorage.removeItem(key);
    } catch {}
  },
};

export const createClient = () => {
  return createSupabaseClient(supabaseUrl, supabaseKey, {
    auth: {
      storage: customSessionStorage,
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
};
