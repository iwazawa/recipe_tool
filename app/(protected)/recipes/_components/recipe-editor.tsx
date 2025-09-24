"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { RecipeForm } from "@/app/(protected)/recipes/_components/recipe-form";
import {
  mapRecipeToFormValues,
  recipeFormToPayload,
} from "@/lib/recipes/mappers";
import {
  createRecipe,
  fetchRecipe,
  updateRecipe,
} from "@/lib/recipes/api-client";
import type { RecipeFormValues } from "@/lib/recipes/schemas";

export type RecipeEditorProps = {
  mode: "create" | "edit";
  recipeId?: string;
};

export function RecipeEditor({ mode, recipeId }: RecipeEditorProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const recipeQuery = useQuery({
    queryKey: ["recipe", recipeId],
    queryFn: () => fetchRecipe(recipeId ?? ""),
    enabled: mode === "edit" && Boolean(recipeId),
    staleTime: 0,
  });

  const mutation = useMutation({
    mutationFn: async (values: RecipeFormValues) => {
      const payload = recipeFormToPayload(values);
      if (mode === "create") {
        return createRecipe(payload);
      }
      if (!recipeId) {
        throw new Error("レシピIDが指定されていません。");
      }
      return updateRecipe(recipeId, payload);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["recipes"] });
      if (recipeId) {
        await queryClient.invalidateQueries({ queryKey: ["recipe", recipeId] });
      }
      router.push("/recipes");
    },
    onError: (error: unknown) => {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("保存に失敗しました。");
      }
    },
  });

  const defaultValues = useMemo(() => {
    if (mode === "edit" && recipeQuery.data) {
      return mapRecipeToFormValues(recipeQuery.data);
    }
    if (mode === "create") {
      return undefined;
    }
    return undefined;
  }, [mode, recipeQuery.data]);

  const handleSubmit = async (values: RecipeFormValues) => {
    setErrorMessage(null);
    await mutation.mutateAsync(values);
  };

  if (mode === "edit" && recipeQuery.isLoading) {
    return (
      <div className="rounded-3xl border border-dashed border-border/70 bg-card/60 p-6 text-sm text-muted-foreground">
        レシピ情報を読み込んでいます...
      </div>
    );
  }

  if (mode === "edit" && recipeQuery.isError) {
    return (
      <div className="rounded-3xl border border-destructive/40 bg-destructive/10 p-6 text-sm text-destructive">
        レシピの取得に失敗しました。ページを再読み込みして再試行してください。
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="space-y-3 rounded-3xl border border-border/60 bg-card/80 p-8 shadow-lg shadow-primary/5">
        <span className="inline-flex w-fit items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          {mode === "create" ? "New" : "Edit"}
        </span>
        <h1 className="text-2xl font-semibold text-foreground">
          {mode === "create" ? "レシピを登録" : "レシピを編集"}
        </h1>
        <p className="text-sm text-muted-foreground">
          料理名、人数、材料、作り方を入力して保存すると、献立提案の候補になります。
        </p>
      </div>

      <div className="rounded-3xl border border-border/60 bg-card/70 p-8 shadow-md shadow-primary/5">
        <RecipeForm
          defaultValues={defaultValues}
          submitLabel={mode === "create" ? "レシピを登録" : "保存"}
          onSubmit={handleSubmit}
          errorMessage={errorMessage}
          isSubmitting={mutation.isPending}
          secondaryAction={
            <Button
              asChild
              variant="outline"
              type="button"
              disabled={mutation.isPending}
              className="rounded-full px-5"
            >
              <Link href="/recipes">キャンセル</Link>
            </Button>
          }
        />
      </div>
    </div>
  );
}
