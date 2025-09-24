import type { DishType } from "@/lib/supabase/types";

import type {
  AggregatedShoppingList,
  RecipeSummary,
  SuggestScope,
  SuggestionComputation,
  SuggestionContext,
} from "@/lib/menus/types";

const TOKYO_TIME_ZONE = "Asia/Tokyo";

const dateFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: TOKYO_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

function toTokyoISODate(date: Date): string {
  return dateFormatter.format(date);
}

function addDaysTokyo(baseDate: Date, days: number): Date {
  const newDate = new Date(baseDate);
  newDate.setUTCDate(newDate.getUTCDate() + days);
  return newDate;
}

function shuffle<T>(array: T[]): T[] {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function pickRandom<T>(items: T[]): T {
  if (items.length === 0) {
    throw new Error("候補が不足しています。");
  }
  const index = Math.floor(Math.random() * items.length);
  return items[index];
}

function normalizeIngredientName(name: string): string {
  return name
    .normalize("NFKC")
    .replace(/\s+/g, "")
    .toLowerCase();
}

export function aggregateIngredients(recipes: RecipeSummary[]): AggregatedShoppingList {
  const map = new Map<string, {
    name: string;
    normalizedName: string;
    amount: number | null;
    unit: string | null;
    recipeNames: Set<string>;
  }>();

  for (const recipe of recipes) {
    for (const ingredient of recipe.ingredients) {
      const normalizedName = normalizeIngredientName(ingredient.name);
      const unit = ingredient.unit ?? null;
      const key = `${normalizedName}::${unit ?? ""}`;
      const existing = map.get(key);
      const amount = ingredient.amount ?? null;

      if (!existing) {
        map.set(key, {
          name: ingredient.name,
          normalizedName,
          amount,
          unit,
          recipeNames: new Set(recipe.name ? [recipe.name] : []),
        });
        if (recipe.name) {
          map.get(key)?.recipeNames.add(recipe.name);
        }
        continue;
      }

      if (amount != null && existing.amount != null && unit === existing.unit) {
        existing.amount += amount;
      } else if (amount != null && existing.amount == null) {
        existing.amount = amount;
      }

      if (recipe.name) {
        existing.recipeNames.add(recipe.name);
      }
    }
  }

  return Array.from(map.values()).map((item) => ({
    name: item.name,
    normalizedName: item.normalizedName,
    amount: item.amount,
    unit: item.unit,
    recipeNames: Array.from(item.recipeNames),
  }));
}

function getTodayTokyoDate(): Date {
  const now = new Date();
  const parts = dateFormatter.formatToParts(now);
  const year = Number(parts.find((part) => part.type === "year")?.value ?? now.getFullYear());
  const month = Number(parts.find((part) => part.type === "month")?.value ?? now.getMonth() + 1);
  const day = Number(parts.find((part) => part.type === "day")?.value ?? now.getDate());
  return new Date(Date.UTC(year, month - 1, day));
}

function ensureRecipeSupply(recipes: RecipeSummary[], type: DishType, count: number) {
  const filtered = recipes.filter((recipe) => recipe.dishType === type);
  if (filtered.length < count) {
    throw new Error(
      `${type === "main" ? "主菜" : "副菜"}の候補が不足しています（必要: ${count}件）。`
    );
  }
  return filtered;
}

export function computeSuggestion(
  context: SuggestionContext,
  scope: SuggestScope,
  options?: { ingredientFilters?: string[] }
): SuggestionComputation {
  const today = getTodayTokyoDate();

  let candidateRecipes = context.recipes;

  const normalizedFilters = (options?.ingredientFilters ?? [])
    .map((item) => item.trim())
    .filter(Boolean)
    .map(normalizeIngredientName);

  if (normalizedFilters.length > 0) {
    candidateRecipes = context.recipes.filter((recipe) =>
      recipe.ingredients.some((ingredient) => {
        const normalizedIngredient = normalizeIngredientName(ingredient.name);
        return normalizedFilters.some(
          (filterToken) =>
            normalizedIngredient.includes(filterToken) || filterToken.includes(normalizedIngredient)
        );
      })
    );

    if (candidateRecipes.length === 0) {
      throw new Error("指定された食材を利用したレシピが見つかりませんでした。");
    }
  }

  if (scope === "today") {
    const mains = ensureRecipeSupply(candidateRecipes, "main", 1);
    const sides = ensureRecipeSupply(candidateRecipes, "side", 1);
    const mainRecipe = pickRandom(mains);
    const sideRecipe = pickRandom(sides);
    const startDate = toTokyoISODate(today);

    const items = [
      { targetDate: startDate, slot: "main" as DishType, recipe: mainRecipe },
      { targetDate: startDate, slot: "side" as DishType, recipe: sideRecipe },
    ];

    const shoppingList = aggregateIngredients([mainRecipe, sideRecipe]);

    return {
      menuType: "today",
      startDate,
      endDate: startDate,
      items,
      shoppingList,
    };
  }

  const mains = ensureRecipeSupply(candidateRecipes, "main", 7);
  const sides = ensureRecipeSupply(candidateRecipes, "side", 7);

  const shuffledMains = shuffle(mains).slice(0, 7);
  const shuffledSides = shuffle(sides).slice(0, 7);

  const items: SuggestionComputation["items"] = [];
  const aggregatedRecipes: RecipeSummary[] = [];

  for (let dayIndex = 0; dayIndex < 7; dayIndex += 1) {
    const date = toTokyoISODate(addDaysTokyo(today, dayIndex));
    const mainRecipe = shuffledMains[dayIndex];
    const sideRecipe = shuffledSides[dayIndex];
    items.push(
      { targetDate: date, slot: "main", recipe: mainRecipe },
      { targetDate: date, slot: "side", recipe: sideRecipe }
    );
    aggregatedRecipes.push(mainRecipe, sideRecipe);
  }

  const shoppingList = aggregateIngredients(aggregatedRecipes);
  const startDate = items[0]?.targetDate ?? toTokyoISODate(today);
  const endDate = items[items.length - 1]?.targetDate ?? startDate;

  return {
    menuType: "week",
    startDate,
    endDate,
    items,
    shoppingList,
  };
}
