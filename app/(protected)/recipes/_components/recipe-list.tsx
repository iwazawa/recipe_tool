"use client";

import { useDeferredValue, useMemo, useState } from "react";
import Link from "next/link";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  deleteRecipe,
  fetchRecipes,
} from "@/lib/recipes/api-client";
import type { Recipe } from "@/lib/recipes/types";
import { formatIngredientLine } from "@/lib/recipes/types";

const dishTypeLabel: Record<Recipe["dishType"], string> = {
  main: "主菜",
  side: "副菜",
};

type DishTypeFilter = "all" | Recipe["dishType"];

export function RecipeList() {
  const queryClient = useQueryClient();
  const [dishType, setDishType] = useState<DishTypeFilter>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const deferredSearch = useDeferredValue(searchTerm.trim());

  const recipesQuery = useQuery({
    queryKey: ["recipes", dishType, deferredSearch],
    queryFn: () =>
      fetchRecipes({
        type: dishType === "all" ? undefined : dishType,
        search: deferredSearch || undefined,
      }),
    staleTime: 0,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteRecipe,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["recipes"] });
    },
  });

  const handleDelete = async (recipeId: string) => {
    if (!window.confirm("このレシピを削除しますか？")) {
      return;
    }
    await deleteMutation.mutateAsync(recipeId);
  };

  const recipes = useMemo(() => recipesQuery.data ?? [], [recipesQuery.data]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex w-full flex-col gap-2 sm:max-w-md">
          <label className="text-sm font-semibold text-foreground" htmlFor="recipe-search">
            レシピ名で検索
          </label>
          <Input
            id="recipe-search"
            placeholder="例）照り焼き"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="h-11 rounded-xl border-border/70 bg-background/80 shadow-sm focus-visible:ring-2 focus-visible:ring-primary/40"
          />
        </div>
        <div className="flex items-end gap-2">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-foreground" htmlFor="dish-type-filter">
              種別フィルタ
            </label>
            <select
              id="dish-type-filter"
              className="h-11 rounded-xl border border-border/70 bg-background/80 px-3 text-sm shadow-sm transition focus:border-primary/60 focus:outline-none"
              value={dishType}
              onChange={(event) => setDishType(event.target.value as DishTypeFilter)}
            >
              <option value="all">すべて</option>
              <option value="main">主菜</option>
              <option value="side">副菜</option>
            </select>
          </div>
        </div>
      </div>

      {recipesQuery.isLoading ? (
        <div className="rounded-3xl border border-dashed border-border/70 bg-card/60 p-6 text-sm text-muted-foreground">
          レシピを読み込んでいます...
        </div>
      ) : null}

      {recipesQuery.isError ? (
        <div className="rounded-3xl border border-destructive/40 bg-destructive/10 p-6 text-sm text-destructive">
          レシピ一覧の取得に失敗しました。ページを再読み込みして再試行してください。
        </div>
      ) : null}

      {recipesQuery.isSuccess && recipes.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border/70 bg-card/60 p-6 text-sm text-muted-foreground">
          レシピがまだ登録されていません。右上の「新規レシピ」ボタンから登録を始めましょう。
        </div>
      ) : null}

      {recipes.length > 0 ? (
        <div className="space-y-4">
          {recipes.map((recipe) => (
            <div
              key={recipe.id}
              className="rounded-3xl border border-border/60 bg-card/80 p-6 shadow-sm shadow-primary/5 transition hover:-translate-y-0.5 hover:shadow-primary/10"
            >
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span className="rounded-full bg-secondary/80 px-3 py-1 text-[11px] font-medium uppercase text-secondary-foreground">
                      {dishTypeLabel[recipe.dishType]}
                    </span>
                    {recipe.servings ? (
                      <span className="rounded-full bg-muted px-3 py-1 text-[11px] text-muted-foreground">
                        {recipe.servings}人前
                      </span>
                    ) : null}
                    {recipe.costRank ? (
                      <span className="rounded-full bg-muted px-3 py-1 text-[11px] text-muted-foreground">
                        費用ランク {recipe.costRank}
                      </span>
                    ) : null}
                    {recipe.timeMinutes ? (
                      <span className="rounded-full bg-muted px-3 py-1 text-[11px] text-muted-foreground">
                        所要 {recipe.timeMinutes}分
                      </span>
                    ) : null}
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">{recipe.name}</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>材料リスト</span>
                      <Button
                        type="button"
                        variant="subtle"
                        size="sm"
                        className="rounded-full px-3"
                        onClick={async () => {
                          const copyText = recipe.ingredients
                            .map((ingredient) => formatIngredientLine({ ...ingredient }))
                            .join("\n");
                          await navigator.clipboard.writeText(copyText);
                        }}
                      >
                        コピー
                      </Button>
                    </div>
                    <ul className="space-y-1 rounded-2xl border border-border/60 bg-background/70 p-4 text-sm text-muted-foreground">
                      {recipe.ingredients.map((ingredient) => (
                        <li key={ingredient.id}>{formatIngredientLine({ ...ingredient })}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="flex flex-col gap-2 self-end sm:self-start">
                  <Button asChild variant="outline" size="sm" className="rounded-full px-4">
                    <Link href={`/recipes/${recipe.id}`}>編集</Link>
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="rounded-full px-4"
                    onClick={() => handleDelete(recipe.id)}
                    disabled={deleteMutation.isPending}
                  >
                    削除
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
