import { NextRequest } from "next/server";
import { z } from "zod";

import { buildRecipeInsertPayload, mapRecipeRow } from "@/lib/recipes/mappers";
import type { IngredientRow, RecipeRow } from "@/lib/recipes/types";
import { recipePayloadSchema } from "@/lib/recipes/schemas";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const listQuerySchema = z.object({
  type: z.enum(["main", "side"]).optional(),
  search: z.string().optional(),
});

type RecipeSelectRow = RecipeRow & {
  recipe_ingredients: IngredientRow[] | null;
};

function unauthorized() {
  return Response.json({ message: "Unauthorized" }, { status: 401 });
}

function badRequest(message: string) {
  return Response.json({ message }, { status: 400 });
}

function internalError(message: string) {
  return Response.json({ message }, { status: 500 });
}

export async function GET(request: NextRequest) {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return unauthorized();
  }

  const url = new URL(request.url);
  const searchParams = Object.fromEntries(url.searchParams.entries());
  const parsedQuery = listQuerySchema.safeParse(searchParams);

  if (!parsedQuery.success) {
    return badRequest("クエリパラメータが不正です。");
  }

  const query = supabase
    .from("recipes")
    .select(
      "id, user_id, name, servings, dish_type, time_minutes, cost_rank, instructions, source_url, created_at, updated_at, recipe_ingredients ( id, name, amount, unit, note )"
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const { type, search } = parsedQuery.data;

  if (type) {
    query.eq("dish_type", type);
  }

  if (search) {
    query.ilike("name", `%${search}%`);
  }

  const { data, error } = await query.returns<RecipeSelectRow[]>();

  if (error) {
    return internalError(error.message);
  }

  const recipes = (data ?? []).map((recipe) =>
    mapRecipeRow(recipe, recipe.recipe_ingredients ?? [])
  );

  return Response.json({ data: recipes });
}

export async function POST(request: NextRequest) {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return unauthorized();
  }

  let payload: z.infer<typeof recipePayloadSchema>;

  try {
    const body = await request.json();
    payload = recipePayloadSchema.parse(body);
  } catch (error) {
    console.error("Failed to parse recipe payload", error);
    return badRequest("レシピの入力内容を確認してください。");
  }

  const { recipe, ingredients } = buildRecipeInsertPayload(payload, user.id);

  const { data: createdRecipe, error: recipeError } = await supabase
    .from("recipes")
    .insert(recipe)
    .select(
      "id, user_id, name, servings, dish_type, time_minutes, cost_rank, instructions, source_url, created_at, updated_at"
    )
    .single();

  if (recipeError || !createdRecipe) {
    return internalError(recipeError?.message ?? "レシピの作成に失敗しました。");
  }

  const { error: ingredientError } = await supabase.from("recipe_ingredients").insert(
    ingredients.map((ingredient) => ({
      ...ingredient,
      recipe_id: createdRecipe.id,
    }))
  );

  if (ingredientError) {
    await supabase.from("recipes").delete().eq("id", createdRecipe.id);
    return internalError(ingredientError.message);
  }

  const { data: fullRecipe, error: fetchError } = await supabase
    .from("recipes")
    .select(
      "id, user_id, name, servings, dish_type, time_minutes, cost_rank, instructions, source_url, created_at, updated_at, recipe_ingredients ( id, name, amount, unit, note )"
    )
    .eq("id", createdRecipe.id)
    .single<RecipeSelectRow>();

  if (fetchError || !fullRecipe) {
    return internalError(fetchError?.message ?? "作成済みレシピの取得に失敗しました。");
  }

  const recipeDto = mapRecipeRow(fullRecipe, fullRecipe.recipe_ingredients ?? []);

  return Response.json({ data: recipeDto }, { status: 201 });
}
