import type { Metadata } from "next";

import { RecipeEditor } from "@/app/(protected)/recipes/_components/recipe-editor";

export const metadata: Metadata = {
  title: "レシピ編集 | 献立アシスタント",
};

export default function EditRecipePage({ params }: { params: { id: string } }) {
  return (
    <div className="max-w-3xl space-y-8">
      <RecipeEditor mode="edit" recipeId={params.id} />
    </div>
  );
}
