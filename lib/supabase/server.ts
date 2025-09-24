import { cookies } from "next/headers";
import {
  createServerClient,
  type CookieOptions,
} from "@supabase/ssr";

import { getSupabaseClientConfig } from "@/lib/env";
import type { Database } from "@/lib/supabase/types";

export function getSupabaseServerClient() {
  const cookieStore = cookies();
  const { url, anonKey } = getSupabaseClientConfig();

  return createServerClient<Database>(url, anonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.then((store) => store.get(name)?.value);
      },
      set(name: string, value: string, options: CookieOptions) {
        cookieStore.then((store) => store.set({ name, value, ...options }));
      },
      remove(name: string, options: CookieOptions) {
        cookieStore.then((store) => store.set({ name, value: "", ...options }));
      },
    },
  });
}
