import type { MenuSuggestionPayload, SuggestScope } from "@/lib/menus/types";

async function parseJson<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = (data as { message?: string }).message ?? "リクエストに失敗しました。";
    throw new Error(message);
  }
  return data as T;
}

export async function suggestMenu(scope: SuggestScope, ingredients?: string[]) {
  const response = await fetch("/api/menu/suggest", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ scope, ingredients }),
  });
  const data = await parseJson<{ data: MenuSuggestionPayload }>(response);
  return data.data;
}
