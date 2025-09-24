import type {
  Ingredient,
  IngredientInsert,
  IngredientRow,
  Recipe,
  RecipeInsert,
  RecipeRow,
  RecipeUpdate,
} from "@/lib/recipes/types";
import type {
  RecipeFormValues,
  RecipeInput,
  RecipePayload,
} from "@/lib/recipes/schemas";

export function mapIngredientRow(row: IngredientRow): Ingredient {
  return {
    id: row.id,
    name: row.name,
    amount: row.amount ?? null,
    unit: row.unit ?? null,
    note: row.note ?? null,
  };
}

export function mapRecipeRow(
  recipe: RecipeRow,
  ingredients: IngredientRow[]
): Recipe {
  return {
    id: recipe.id,
    name: recipe.name,
    servings: recipe.servings,
    dishType: recipe.dish_type,
    timeMinutes: recipe.time_minutes ?? null,
    costRank: recipe.cost_rank ?? null,
    instructions: recipe.instructions ?? null,
    sourceUrl: recipe.source_url ?? null,
    createdAt: recipe.created_at,
    updatedAt: recipe.updated_at,
    ingredients: ingredients.map(mapIngredientRow),
  };
}

export function buildRecipeInsertPayload(
  input: RecipeInput,
  userId: string
): {
  recipe: Omit<RecipeInsert, "id">;
  ingredients: Array<Omit<IngredientInsert, "id" | "recipe_id">>;
} {
  return {
    recipe: {
      user_id: userId,
      name: input.name,
      servings: input.servings,
      dish_type: input.dishType,
      time_minutes: input.timeMinutes ?? null,
      cost_rank: input.costRank ?? null,
      instructions: input.instructions ?? null,
      source_url: input.sourceUrl ?? null,
    },
    ingredients: input.ingredients.map((ingredient) => ({
      name: ingredient.name,
      amount: ingredient.amount ?? null,
      unit: ingredient.unit ?? null,
      note: ingredient.note ?? null,
    })),
  };
}

export function buildRecipeUpdatePayload(
  input: RecipeInput,
  userId: string
): {
  recipe: RecipeUpdate;
  ingredients: Array<
    Partial<Pick<IngredientInsert, "id">> &
      Omit<IngredientInsert, "id" | "recipe_id">
  >;
} {
  return {
    recipe: {
      id: input.id,
      user_id: userId,
      name: input.name,
      servings: input.servings,
      dish_type: input.dishType,
      time_minutes: input.timeMinutes ?? null,
      cost_rank: input.costRank ?? null,
      instructions: input.instructions ?? null,
      source_url: input.sourceUrl ?? null,
    },
    ingredients: input.ingredients.map((ingredient) => ({
      ...(ingredient.id ? { id: ingredient.id } : {}),
      name: ingredient.name,
      amount: ingredient.amount ?? null,
      unit: ingredient.unit ?? null,
      note: ingredient.note ?? null,
    })),
  };
}

export function mapRecipeToFormValues(recipe: Recipe): RecipeFormValues {
  return {
    id: recipe.id,
    name: recipe.name,
    servings: recipe.servings ?? 1,
    dishType: recipe.dishType,
    timeMinutes: recipe.timeMinutes != null ? String(recipe.timeMinutes) : undefined,
    costRank: recipe.costRank ?? null,
    instructions: recipe.instructions ?? "",
    sourceUrl: recipe.sourceUrl ?? "",
    ingredients: recipe.ingredients.map((ingredient) => ({
      id: ingredient.id,
      name: ingredient.name,
      amount: ingredient.amount != null ? String(ingredient.amount) : undefined,
      unit: ingredient.unit ?? undefined,
      note: ingredient.note ?? undefined,
    })),
  };
}

export function recipeFormToPayload(values: RecipeFormValues): RecipePayload {
  return {
    id: values.id,
    name: values.name,
    servings: values.servings,
    dishType: values.dishType,
    timeMinutes:
      values.timeMinutes && values.timeMinutes.trim() !== ""
        ? Number(values.timeMinutes)
        : null,
    costRank:
      values.costRank
        ? (values.costRank as "S" | "A" | "B" | "C")
        : null,
    instructions: values.instructions?.trim() ? values.instructions : null,
    sourceUrl: values.sourceUrl && values.sourceUrl.trim() !== "" ? values.sourceUrl : null,
    ingredients: values.ingredients.map((ingredient) => ({
      id: ingredient.id,
      name: ingredient.name,
      amount:
        ingredient.amount && ingredient.amount.trim() !== ""
          ? Number(ingredient.amount)
          : null,
      unit: ingredient.unit && ingredient.unit.trim() !== "" ? ingredient.unit : null,
      note: ingredient.note && ingredient.note.trim() !== "" ? ingredient.note : null,
    })),
  };
}
