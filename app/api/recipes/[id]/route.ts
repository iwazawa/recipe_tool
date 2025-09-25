import { randomUUID } from "node:crypto";

import { NextRequest } from "next/server";
import { z } from "zod";

import { buildRecipeUpdatePayload, mapRecipeRow } from "@/lib/recipes/mappers";
import { recipePayloadSchema } from "@/lib/recipes/schemas";
import type { IngredientRow, RecipeRow } from "@/lib/recipes/types";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const paramsSchema = z.object({
  id: z.string().uuid(),
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

function notFound() {
  return Response.json({ message: "対象のレシピが見つかりません。" }, { status: 404 });
}

function internalError(message: string) {
  return Response.json({ message }, { status: 500 });
}

async function fetchRecipeById(
  supabase: Awaited<ReturnType<typeof getSupabaseServerClient>>,
  userId: string,
  id: string
) {
  const { data, error } = await supabase
    .from("recipes")
    .select(
      "id, user_id, name, servings, dish_type, time_minutes, cost_rank, instructions, source_url, created_at, updated_at, recipe_ingredients ( id, name, amount, unit, note )"
    )
    .eq("user_id", userId)
    .eq("id", id)
    .single<RecipeSelectRow>();

  if (error) {
    return { data: null, error };
  }

  return { data, error: null };
}

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return unauthorized();
  }

  const { id } = paramsSchema.parse(await context.params);

  const { data, error } = await fetchRecipeById(supabase, user.id, id);

  if (error) {
    if (error.code === "PGRST116" || error.code === "PGRST103") {
      return notFound();
    }
    return internalError(error.message);
  }

  if (!data) {
    return notFound();
  }

  const recipeDto = mapRecipeRow(data, data.recipe_ingredients ?? []);
  return Response.json({ data: recipeDto });
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return unauthorized();
  }

  const { id } = paramsSchema.parse(await context.params);

  let payload: z.infer<typeof recipePayloadSchema>;

  try {
    payload = recipePayloadSchema.parse(await request.json());
  } catch (error) {
    console.error("Failed to parse recipe payload", error);
    return badRequest("レシピの入力内容を確認してください。");
  }

  const normalizedPayload = { ...payload, id };

  const { recipe, ingredients } = buildRecipeUpdatePayload(normalizedPayload, user.id);

  const { error: updateError } = await supabase
    .from("recipes")
    .update({
      name: recipe.name,
      servings: recipe.servings,
      dish_type: recipe.dish_type,
      instructions: recipe.instructions ?? null,
      source_url: recipe.source_url ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (updateError) {
    return internalError(updateError.message);
  }

  const { data: existingIngredients } = await supabase
    .from("recipe_ingredients")
    .select("id")
    .eq("recipe_id", id);

  const upsertPayload = ingredients.map((ingredient) => {
    const payloadId = ingredient.id ?? randomUUID();

    return {
      id: payloadId,
      recipe_id: id,
      name: ingredient.name,
      amount: ingredient.amount ?? null,
      unit: ingredient.unit ?? null,
      note: ingredient.note ?? null,
    };
  });

  const { error: upsertError } = await supabase
    .from("recipe_ingredients")
    .upsert(upsertPayload, { onConflict: "id" });

  if (upsertError) {
    return internalError(upsertError.message);
  }

  const keepIds = new Set(upsertPayload.map((item) => item.id));

  const removableIds = (existingIngredients ?? [])
    .map((row) => row.id)
    .filter((existingId) => !keepIds.has(existingId));

  if (removableIds.length > 0) {
    await supabase
      .from("recipe_ingredients")
      .delete()
      .in("id", removableIds);
  }

  const { data: fullRecipe, error: fetchError } = await fetchRecipeById(
    supabase,
    user.id,
    id
  );

  if (fetchError || !fullRecipe) {
    return internalError(fetchError?.message ?? "更新済みレシピの取得に失敗しました。");
  }

  return Response.json({ data: mapRecipeRow(fullRecipe, fullRecipe.recipe_ingredients ?? []) });
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return unauthorized();
  }

  const { id } = paramsSchema.parse(await context.params);

  const { error } = await supabase
    .from("recipes")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return internalError(error.message);
  }

  return Response.json({ success: true });
}
