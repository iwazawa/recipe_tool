"use client";

import { type ReactNode, useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  RecipeFormValues,
  recipeFormSchema,
} from "@/lib/recipes/schemas";
import { parseIngredientsFromText } from "@/lib/recipes/ingredient-parser";

const defaultIngredient = {
  name: "",
  amount: undefined,
  unit: "",
  note: "",
} as const;

const baseDefaultValues: RecipeFormValues = {
  name: "",
  servings: 2,
  dishType: "main",
  timeMinutes: undefined,
  costRank: undefined,
  instructions: "",
  sourceUrl: "",
  ingredients: [defaultIngredient],
};

export type RecipeFormProps = {
  defaultValues?: RecipeFormValues;
  onSubmit: (values: RecipeFormValues) => Promise<void> | void;
  submitLabel: string;
  secondaryAction?: ReactNode;
  errorMessage?: string | null;
  isSubmitting?: boolean;
};

export function RecipeForm({
  defaultValues: initialValues,
  onSubmit,
  submitLabel,
  secondaryAction,
  errorMessage,
  isSubmitting,
}: RecipeFormProps) {
  const form = useForm<RecipeFormValues>({
    resolver: zodResolver<RecipeFormValues>(recipeFormSchema),
    defaultValues: initialValues ?? baseDefaultValues,
  });

  const [bulkInput, setBulkInput] = useState("");
  const [bulkMessage, setBulkMessage] = useState<string | null>(null);
  const [bulkError, setBulkError] = useState<string | null>(null);

  useEffect(() => {
    if (initialValues) {
      form.reset(initialValues);
    }
  }, [initialValues, form]);

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "ingredients",
  });

  const handleAddIngredient = () => {
    append({ ...defaultIngredient });
  };

  const handleRemoveIngredient = (index: number) => {
    if (fields.length === 1) {
      return;
    }
    remove(index);
  };

  const handleBulkParse = () => {
    const parsed = parseIngredientsFromText(bulkInput);

    if (!parsed.length) {
      setBulkError("材料を認識できませんでした。書式を確認してください。");
      setBulkMessage(null);
      return;
    }

    parsed.forEach((ingredient) => {
      append({
        name: ingredient.name,
        amount: ingredient.amount,
        unit: ingredient.unit,
        note: ingredient.note,
      });
    });

    setBulkInput("");
    setBulkError(null);
    setBulkMessage(`${parsed.length}件の材料を追加しました。`);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(async (values) => {
          await onSubmit(values);
        })}
        className="space-y-8"
      >
        <div className="grid gap-6 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="sm:col-span-2">
                <FormLabel>料理名</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="例）鶏の照り焼き"
                    disabled={isSubmitting}
                    className="shadow-md"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="servings"
            render={({ field }) => (
              <FormItem>
                <FormLabel>人数</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    min={1}
                    step={1}
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="dishType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>種別</FormLabel>
                <FormControl>
                  <select
                    {...field}
                    className="h-11 w-full rounded-xl border border-border/70 bg-background/80 px-4 text-sm shadow-sm transition focus:border-primary/60 focus:outline-none"
                    disabled={isSubmitting}
                  >
                    <option value="main">主菜</option>
                    <option value="side">副菜</option>
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="timeMinutes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>所要時間（分）</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="30"
                    disabled={isSubmitting}
                    className="shadow-md"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="costRank"
            render={({ field }) => (
              <FormItem>
                <FormLabel>1人あたり費用ランク</FormLabel>
                <FormControl>
                  <select
                    {...field}
                    className="h-11 w-full rounded-xl border border-border/70 bg-background/80 px-4 text-sm shadow-sm transition focus:border-primary/60 focus:outline-none"
                    disabled={isSubmitting}
                  >
                    <option value="">未設定</option>
                    <option value="S">S（最安）</option>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C（高め）</option>
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="sourceUrl"
            render={({ field }) => (
              <FormItem className="sm:col-span-2">
                <FormLabel>参考URL</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="https://example.com"
                    disabled={isSubmitting}
                    className="shadow-md"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="instructions"
            render={({ field }) => (
              <FormItem className="sm:col-span-2">
                <FormLabel>作り方メモ</FormLabel>
                <FormControl>
                  <textarea
                    {...field}
                    rows={6}
                    className="w-full rounded-xl border border-border/70 bg-background/80 px-4 py-3 text-sm shadow-sm transition focus:border-primary/60 focus:outline-none"
                    placeholder="調理手順をメモできます"
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">材料</h2>
            <Button
              type="button"
              variant="outline"
              className="rounded-full px-4"
              onClick={handleAddIngredient}
              disabled={isSubmitting}
            >
              材料を追加
            </Button>
          </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-border/60 bg-background/80 p-5 shadow-sm shadow-primary/5">
            <div className="space-y-2">
              <FormLabel className="text-sm font-semibold text-foreground">
                テキストから材料を追加
              </FormLabel>
              <p className="text-xs text-muted-foreground">
                「・生米…1合」のような形式で貼り付けると自動で材料を分解します。
              </p>
              <textarea
                value={bulkInput}
                onChange={(event) => setBulkInput(event.target.value)}
                rows={4}
                placeholder="・生米…1合\n・きのこ…たっぷり好きなだけ"
                className="mt-2 w-full rounded-xl border border-border/70 bg-background/90 px-4 py-3 text-sm shadow-sm transition focus:border-primary/60 focus:outline-none"
                disabled={isSubmitting}
              />
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
              {bulkError ? (
                <span className="text-destructive">{bulkError}</span>
              ) : bulkMessage ? (
                <span className="text-primary">{bulkMessage}</span>
              ) : (
                <span className="text-muted-foreground">材料ごとに1行ずつ入力してください。</span>
              )}
              <Button
                type="button"
                variant="outline"
                className="rounded-full px-4"
                onClick={handleBulkParse}
                disabled={isSubmitting || !bulkInput.trim()}
              >
                解析して追加
              </Button>
            </div>
          </div>

          {fields.map((field, index) => (
            <div
              key={field.id}
                className="rounded-2xl border border-border/70 bg-background/70 p-5 shadow-sm shadow-primary/5"
              >
                <div className="grid gap-4 sm:grid-cols-4">
                  <FormField
                    control={form.control}
                    name={`ingredients.${index}.name`}
                    render={({ field: ingredientField }) => (
                      <FormItem className="sm:col-span-2">
                        <FormLabel>材料名</FormLabel>
                        <FormControl>
                          <Input
                            {...ingredientField}
                            placeholder="例）鶏もも肉"
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`ingredients.${index}.amount`}
                    render={({ field: ingredientField }) => (
                      <FormItem>
                        <FormLabel>数量</FormLabel>
                        <FormControl>
                          <Input
                            {...ingredientField}
                            placeholder="300"
                            disabled={isSubmitting}
                            className="sm:max-w-[140px]"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`ingredients.${index}.unit`}
                    render={({ field: ingredientField }) => (
                      <FormItem>
                        <FormLabel>単位</FormLabel>
                        <FormControl>
                          <Input
                            {...ingredientField}
                            placeholder="g / 個 / ml"
                            disabled={isSubmitting}
                            className="sm:max-w-[140px]"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_auto]">
                  <FormField
                    control={form.control}
                    name={`ingredients.${index}.note`}
                    render={({ field: ingredientField }) => (
                      <FormItem>
                        <FormLabel>メモ</FormLabel>
                        <FormControl>
                          <Input
                            {...ingredientField}
                            placeholder="下味用 など"
                            disabled={isSubmitting}
                            className="shadow-sm"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    className="rounded-full px-4 text-sm text-muted-foreground transition hover:text-destructive"
                    onClick={() => handleRemoveIngredient(index)}
                    disabled={isSubmitting || fields.length === 1}
                  >
                    削除
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {errorMessage ? (
          <p className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {errorMessage}
          </p>
        ) : null}

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          {secondaryAction}
          <Button type="submit" disabled={isSubmitting} className="rounded-full px-5">
            {isSubmitting ? "保存中..." : submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  );
}
