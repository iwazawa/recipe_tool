import type { Database } from "@/lib/supabase/types";

export type DishType = Database["public"]["Tables"]["recipes"]["Row"]["dish_type"];

export type RecipeRow = Database["public"]["Tables"]["recipes"]["Row"];
export type RecipeInsert = Database["public"]["Tables"]["recipes"]["Insert"];
export type RecipeUpdate = Database["public"]["Tables"]["recipes"]["Update"];

export type IngredientRow = Database["public"]["Tables"]["recipe_ingredients"]["Row"];
export type IngredientInsert = Database["public"]["Tables"]["recipe_ingredients"]["Insert"];
export type IngredientUpdate = Database["public"]["Tables"]["recipe_ingredients"]["Update"];

export type RecipeWithIngredientsRow = RecipeRow & {
  ingredients: IngredientRow[];
};

export type Ingredient = {
  id: string;
  name: string;
  amount: number | null;
  unit: string | null;
  note: string | null;
};

export type Recipe = {
  id: string;
  name: string;
  servings: number | null;
  dishType: DishType;
  timeMinutes: number | null;
  costRank: "S" | "A" | "B" | "C" | null;
  instructions: string | null;
  sourceUrl: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  ingredients: Ingredient[];
};

export function formatIngredientLine(ingredient: Ingredient): string {
  const parts = [ingredient.name];

  if (ingredient.amount != null) {
    parts.push(String(ingredient.amount));
  }

  if (ingredient.unit) {
    parts.push(ingredient.unit);
  }

  if (ingredient.note) {
    parts.push(`(${ingredient.note})`);
  }

  return parts.join(" ").trim();
}
