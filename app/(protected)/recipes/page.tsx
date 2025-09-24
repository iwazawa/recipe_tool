import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { RecipeList } from "@/app/(protected)/recipes/_components/recipe-list";

export const metadata: Metadata = {
  title: "レシピ一覧 | 献立アシスタント",
};

export default function RecipesPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">レシピ一覧</h1>
          <p className="text-sm text-muted-foreground">
            登録済みレシピを検索・編集できます。献立提案に使いたいレシピを追加しましょう。
          </p>
        </div>
        <Button asChild>
          <Link href="/recipes/new">新規レシピ</Link>
        </Button>
      </div>

      <RecipeList />
    </div>
  );
}
