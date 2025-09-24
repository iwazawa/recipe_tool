import { NextRequest } from "next/server";
import { z } from "zod";

import { computeSuggestion } from "@/lib/menus/suggest";
import { mapRecipeRow } from "@/lib/recipes/mappers";
import type { Recipe } from "@/lib/recipes/types";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const requestSchema = z.object({
  scope: z.enum(["today", "week"]),
  ingredients: z
    .array(z.string())
    .optional()
    .transform((value) => value?.map((item) => item.trim()).filter(Boolean)),
});

type SupabaseRecipeRow = {
  id: string;
  user_id: string;
  name: string;
  servings: number | null;
  dish_type: "main" | "side";
  instructions: string | null;
  source_url: string | null;
  created_at: string | null;
  updated_at: string | null;
  recipe_ingredients: Array<{
    id: string;
    name: string;
    amount: number | null;
    unit: string | null;
    note: string | null;
  } | null> | null;
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

export async function POST(request: NextRequest) {
  const supabase = getSupabaseServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) {
    return internalError(authError.message);
  }

  if (!user) {
    return unauthorized();
  }

  let body: z.infer<typeof requestSchema>;

  try {
    body = requestSchema.parse(await request.json());
  } catch {
    return badRequest("scope の値が不正です。");
  }

  const { data: recipeRows, error: recipeError } = await supabase
    .from("recipes")
    .select(
      "id, user_id, name, servings, dish_type, instructions, source_url, created_at, updated_at, recipe_ingredients ( id, name, amount, unit, note )"
    )
    .eq("user_id", user.id)
    .returns<SupabaseRecipeRow[]>();

  if (recipeError) {
    return internalError(recipeError.message);
  }

  const recipes: Recipe[] = (recipeRows ?? []).map((row) =>
    mapRecipeRow(row, (row.recipe_ingredients ?? []).filter((ing): ing is NonNullable<typeof ing> => !!ing))
  );

  try {
    const suggestion = computeSuggestion(
      { userId: user.id, recipes },
      body.scope,
      { ingredientFilters: body.ingredients }
    );

    const { data: menu, error: menuError } = await supabase
      .from("menus")
      .insert({
        user_id: user.id,
        menu_type: suggestion.menuType,
        start_date: suggestion.startDate,
        end_date: suggestion.endDate,
      })
      .select("*")
      .single();

    if (menuError || !menu) {
      return internalError(menuError?.message ?? "献立の作成に失敗しました。");
    }

    const menuItemsPayload = suggestion.items.map((item) => ({
      menu_id: menu.id,
      target_date: item.targetDate,
      slot: item.slot,
      recipe_id: item.recipe.id,
    }));

    const { data: menuItems, error: menuItemsError } = await supabase
      .from("menu_items")
      .insert(menuItemsPayload)
      .select("*");

    if (menuItemsError || !menuItems) {
      await supabase.from("menus").delete().eq("id", menu.id);
      return internalError(menuItemsError?.message ?? "献立の作成に失敗しました。");
    }

    const shoppingListTitle =
      suggestion.menuType === "today" ? "今日の買い物リスト" : "1週間の買い物リスト";

    const { data: shoppingList, error: shoppingListError } = await supabase
      .from("shopping_lists")
      .insert({
        user_id: user.id,
        title: shoppingListTitle,
        source_menu_id: menu.id,
      })
      .select("*")
      .single();

    if (shoppingListError || !shoppingList) {
      await supabase.from("menu_items").delete().eq("menu_id", menu.id);
      await supabase.from("menus").delete().eq("id", menu.id);
      return internalError(shoppingListError?.message ?? "買い物リストの作成に失敗しました。");
    }

    const shoppingItemsPayload = suggestion.shoppingList.map((item) => ({
      shopping_list_id: shoppingList.id,
      name: item.name,
      amount: item.amount,
      unit: item.unit,
    }));

    const { error: shoppingItemsError } = await supabase
      .from("shopping_list_items")
      .insert(shoppingItemsPayload);

    if (shoppingItemsError) {
      await supabase.from("shopping_lists").delete().eq("id", shoppingList.id);
      await supabase.from("menu_items").delete().eq("menu_id", menu.id);
      await supabase.from("menus").delete().eq("id", menu.id);
      return internalError(shoppingItemsError.message);
    }

    return Response.json({
      data: {
        menu,
        menuItems,
        shoppingList: {
          id: shoppingList.id,
          title: shoppingList.title,
          items: suggestion.shoppingList,
        },
        suggestedItems: suggestion.items.map((item) => ({
          targetDate: item.targetDate,
          slot: item.slot,
          recipe: {
            id: item.recipe.id,
            name: item.recipe.name,
            dishType: item.recipe.dishType,
            servings: item.recipe.servings,
            instructions: item.recipe.instructions,
            sourceUrl: item.recipe.sourceUrl,
          },
        })),
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      return badRequest(error.message);
    }
    return internalError("献立の生成に失敗しました。");
  }
}
