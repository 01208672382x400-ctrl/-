import { createBrowserClient } from "@supabase/ssr";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://fdvgpdfesvigtvmzjhnt.supabase.co";
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_gW5LE2T9Y6rfv63DMHnYew_64sa1cOL";

export function createClient() {
  return createBrowserClient(url, key);
}
