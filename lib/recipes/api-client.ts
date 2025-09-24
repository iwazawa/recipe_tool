import type { Recipe } from "@/lib/recipes/types";
import type { RecipePayload } from "@/lib/recipes/schemas";

async function parseJson<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = (data as { message?: string }).message ?? "リクエストに失敗しました。";
    throw new Error(message);
  }
  return data as T;
}

export async function fetchRecipes(params?: { type?: string; search?: string }) {
  const query = new URLSearchParams();
  if (params?.type) {
    query.set("type", params.type);
  }
  if (params?.search) {
    query.set("search", params.search);
  }
  const url = `/api/recipes${query.toString() ? `?${query.toString()}` : ""}`;
  const response = await fetch(url, { cache: "no-store" });
  const data = await parseJson<{ data: Recipe[] }>(response);
  return data.data;
}

export async function fetchRecipe(id: string) {
  const response = await fetch(`/api/recipes/${id}`, { cache: "no-store" });
  const data = await parseJson<{ data: Recipe }>(response);
  return data.data;
}

export async function createRecipe(payload: RecipePayload) {
  const response = await fetch(`/api/recipes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await parseJson<{ data: Recipe }>(response);
  return data.data;
}

export async function updateRecipe(id: string, payload: RecipePayload) {
  const response = await fetch(`/api/recipes/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await parseJson<{ data: Recipe }>(response);
  return data.data;
}

export async function deleteRecipe(id: string) {
  const response = await fetch(`/api/recipes/${id}`, {
    method: "DELETE",
  });
  await parseJson<{ success: boolean }>(response);
}
