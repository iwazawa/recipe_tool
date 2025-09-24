import type { Recipe } from "@/lib/recipes/types";
import type { Database, DishType, MenuType } from "@/lib/supabase/types";

export type MenuRow = Database["public"]["Tables"]["menus"]["Row"];
export type MenuInsert = Database["public"]["Tables"]["menus"]["Insert"];
export type MenuUpdate = Database["public"]["Tables"]["menus"]["Update"];

export type MenuItemRow = Database["public"]["Tables"]["menu_items"]["Row"];
export type MenuItemInsert = Database["public"]["Tables"]["menu_items"]["Insert"];
export type MenuItemUpdate = Database["public"]["Tables"]["menu_items"]["Update"];

export type ShoppingListRow = Database["public"]["Tables"]["shopping_lists"]["Row"];
export type ShoppingListInsert = Database["public"]["Tables"]["shopping_lists"]["Insert"];
export type ShoppingListItemInsert = Database["public"]["Tables"]["shopping_list_items"]["Insert"];

export type SuggestScope = "today" | "week";

export type SuggestionRequest = {
  scope: SuggestScope;
  ingredients?: string[];
};

export type SuggestionMenuItem = {
  id: string;
  targetDate: string;
  slot: DishType;
  recipeId: string;
};

export type SuggestionResult = {
  menu: MenuRow;
  items: SuggestionMenuItem[];
  shoppingListId: string;
};

export type RecipeSummary = Recipe;

export type SuggestionContext = {
  userId: string;
  recipes: RecipeSummary[];
};

export type AggregatedIngredient = {
  name: string;
  normalizedName: string;
  amount: number | null;
  unit: string | null;
  recipeNames: string[];
};

export type AggregatedShoppingList = AggregatedIngredient[];

export type SuggestionComputation = {
  menuType: MenuType;
  startDate: string;
  endDate: string;
  items: Array<{
    targetDate: string;
    slot: DishType;
    recipe: RecipeSummary;
  }>;
  shoppingList: AggregatedShoppingList;
};

export type SuggestedMenuItem = SuggestionComputation["items"][number];

export type MenuSuggestionPayload = {
  menu: MenuRow;
  menuItems: MenuItemRow[];
  shoppingList: {
    id: string;
    title: string | null;
    items: AggregatedShoppingList;
  };
  suggestedItems: SuggestedMenuItem[];
};
