import { createServerClient } from "./supabase/server";

export async function getAppConfig() {
  const supabase = await createServerClient();
  const { data } = await supabase.from("app_settings").select("key,value");
  const map: Record<string, any> = {};
  for (const row of data ?? []) map[row.key] = row.value;
  return {
    theme: map.theme ?? {},
    features: map.features ?? {},
    home: map.home ?? {},
  };
}
