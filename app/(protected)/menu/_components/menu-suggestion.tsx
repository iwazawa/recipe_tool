"use client";

import { useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { suggestMenu } from "@/lib/menus/api-client";
import type {
  AggregatedShoppingList,
  MenuSuggestionPayload,
  SuggestScope,
} from "@/lib/menus/types";

const scopeLabels: Record<SuggestScope, { title: string; action: string }> = {
  today: {
    title: "今日の献立を提案",
    action: "提案をつくる",
  },
  week: {
    title: "1週間の献立を提案",
    action: "週間献立を生成",
  },
};

const slotLabels = {
  main: "主菜",
  side: "副菜",
} as const;

const dateFormatter = new Intl.DateTimeFormat("ja-JP", {
  timeZone: "Asia/Tokyo",
  year: "numeric",
  month: "short",
  day: "numeric",
  weekday: "short",
});

const servingsFormatter = (servings: number | null) =>
  servings && servings > 0 ? `${servings}人前` : "人数未設定";

const formatDate = (date: string) => {
  const parsed = new Date(`${date}T00:00:00+09:00`);
  return dateFormatter.format(parsed);
};

type GroupedMenuItems = Array<{
  targetDate: string;
  entries: MenuSuggestionPayload["suggestedItems"][number][];
}>;

function groupByDate(items: MenuSuggestionPayload["suggestedItems"]): GroupedMenuItems {
  const map = new Map<string, MenuSuggestionPayload["suggestedItems"]>();
  for (const item of items) {
    if (!map.has(item.targetDate)) {
      map.set(item.targetDate, []);
    }
    map.get(item.targetDate)?.push(item);
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([targetDate, entries]) => ({ targetDate, entries }));
}

function ShoppingListTable({ items }: { items: AggregatedShoppingList }) {
  if (items.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">買い物リストに追加された材料はありません。</p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-border text-sm">
        <thead className="bg-muted/40">
          <tr>
            <th className="px-3 py-2 text-left font-medium">食材</th>
            <th className="px-3 py-2 text-left font-medium">数量</th>
            <th className="px-3 py-2 text-left font-medium">関連レシピ</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {items.map((item) => (
            <tr key={`${item.normalizedName}-${item.unit ?? ""}`}>
              <td className="px-3 py-2 align-top">
                <div className="font-medium">{item.name}</div>
                {item.unit ? (
                  <div className="text-xs text-muted-foreground">単位: {item.unit}</div>
                ) : null}
              </td>
              <td className="px-3 py-2 align-top">{item.amount ?? "-"}</td>
              <td className="px-3 py-2 align-top text-muted-foreground">
                {item.recipeNames.join(" / ")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function MenuSuggestion({ scope }: { scope: SuggestScope }) {
  const [ingredientInput, setIngredientInput] = useState("");

  const mutation = useMutation({
    mutationFn: (filters: string[] | undefined) => suggestMenu(scope, filters),
  });

  const groupedItems = useMemo(() => {
    if (!mutation.data) {
      return [];
    }
    return groupByDate(mutation.data.suggestedItems);
  }, [mutation.data]);

  const handleSubmit = () => {
    const filters = ingredientInput
      .split(/[\n,、]/)
      .map((item) => item.trim())
      .filter(Boolean);

    mutation.mutate(filters.length ? filters : undefined);
  };

  const { title, action } = scopeLabels[scope];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1">
              <CardTitle>{title}</CardTitle>
              <CardDescription>
                登録済みレシピからランダムに主菜と副菜を選び、買い物リストを自動生成します。
              </CardDescription>
            </div>
            <Button onClick={handleSubmit} disabled={mutation.isPending}>
              {mutation.isPending ? "生成中..." : action}
            </Button>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground">
              余っている食材（カンマまたは改行で区切り）
            </label>
            <textarea
              value={ingredientInput}
              onChange={(event) => setIngredientInput(event.target.value)}
              rows={2}
              placeholder="例）じゃがいも, 玉ねぎ"
              className="w-full rounded-xl border border-border/70 bg-background/80 px-4 py-3 text-sm shadow-sm transition focus:border-primary/60 focus:outline-none"
              disabled={mutation.isPending}
            />
            <p className="text-xs text-muted-foreground">
              入力された食材を材料に含むレシピのみから提案します。空の場合は全レシピが対象です。
            </p>
          </div>
        </CardHeader>
      </Card>

      {mutation.isError ? (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
          {(mutation.error as Error).message ?? "献立の生成に失敗しました。"}
        </div>
      ) : null}

      {mutation.data ? (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>生成された献立</CardTitle>
              <CardDescription>
                {scope === "week"
                  ? `${formatDate(mutation.data.menu.start_date)} 〜 ${formatDate(mutation.data.menu.end_date)}`
                  : `${formatDate(mutation.data.menu.start_date)} の献立`}
                {mutation.data?.menuItems.length && ingredientInput.trim() ? (
                  <span className="ml-2 text-xs text-primary">
                    （指定食材: {ingredientInput.split(/[\n,、]/).map((item) => item.trim()).filter(Boolean).join(", ")}）
                  </span>
                ) : null}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {groupedItems.map((group) => (
                <div key={group.targetDate} className="rounded-lg border border-border p-4">
                  <div className="text-sm font-semibold">
                    {formatDate(group.targetDate)}
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {group.entries.map((entry) => (
                      <div key={`${entry.targetDate}-${entry.slot}`} className="space-y-2 rounded-md border border-border/60 p-3">
                        <div className="text-xs font-semibold uppercase text-muted-foreground">
                          {slotLabels[entry.slot as keyof typeof slotLabels]}
                        </div>
                        <div className="text-sm font-medium">{entry.recipe.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {servingsFormatter(entry.recipe.servings)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>買い物リスト</CardTitle>
              <CardDescription>
                {mutation.data.shoppingList.title ?? "集計された食材一覧"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ShoppingListTable items={mutation.data.shoppingList.items} />
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
