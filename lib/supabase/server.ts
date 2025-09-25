import { cookies } from "next/headers";
import {
  createServerClient,
  type CookieOptions,
} from "@supabase/ssr";

import { getSupabaseClientConfig } from "@/lib/env";
import type { Database } from "@/lib/supabase/types";

export async function getSupabaseServerClient() {
  const cookieStore = await cookies();
  const { url, anonKey } = getSupabaseClientConfig();

  return createServerClient<Database>(url, anonKey, {
    cookies: {
      async get(name: string) {
        return cookieStore.get(name)?.value;
      },
      async set(name: string, value: string, options: CookieOptions) {
        cookieStore.set({ name, value, ...options });
      },
      async remove(name: string, options: CookieOptions) {
        cookieStore.set({ name, value: "", ...options });
      },
    },
  });
}
