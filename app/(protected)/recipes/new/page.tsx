import type { Metadata } from "next";

import { RecipeEditor } from "@/app/(protected)/recipes/_components/recipe-editor";

export const metadata: Metadata = {
  title: "レシピ登録 | 献立アシスタント",
};

export default function NewRecipePage() {
  return (
    <div className="max-w-3xl space-y-8">
      <RecipeEditor mode="create" />
    </div>
  );
}
