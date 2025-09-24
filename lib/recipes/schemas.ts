import { z } from "zod";

export const dishTypeSchema = z.enum(["main", "side"]);
export const costRankSchema = z.enum(["S", "A", "B", "C"]);

export const ingredientSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, "材料名を入力してください。"),
  amount: z.number().positive("数量は正の数で入力してください。").nullable().optional(),
  unit: z.string().max(20).nullable().optional(),
  note: z.string().max(120).nullable().optional(),
});

export const recipeSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, "料理名を入力してください。"),
  servings: z
    .number({ invalid_type_error: "人数には数値を入力してください。" })
    .int("人数は整数で入力してください。")
    .positive("人数は1以上で入力してください。"),
  dishType: dishTypeSchema,
  timeMinutes: z
    .number({ invalid_type_error: "所要時間には数値を入力してください。" })
    .int("所要時間は整数で入力してください。")
    .positive("所要時間は1分以上で入力してください。")
    .nullable()
    .optional(),
  costRank: costRankSchema.nullable().optional(),
  instructions: z.string().nullable().optional(),
  sourceUrl: z.string().url("URL形式で入力してください。").nullable().optional(),
  ingredients: z
    .array(ingredientSchema)
    .min(1, "少なくとも1件の材料を追加してください。"),
});

export type IngredientInput = z.infer<typeof ingredientSchema>;
export type RecipeInput = z.infer<typeof recipeSchema>;

export const ingredientPayloadSchema = ingredientSchema;
export const recipePayloadSchema = recipeSchema;

export type IngredientPayload = z.infer<typeof ingredientPayloadSchema>;
export type RecipePayload = z.infer<typeof recipePayloadSchema>;

const optionalNumberString = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value === "" || value === undefined ? undefined : value))
  .refine((value) => {
    if (value === undefined) return true;
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed > 0;
  }, "数量は正の数で入力してください。");

const optionalPositiveIntString = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value === "" || value === undefined ? undefined : value))
  .refine((value) => {
    if (value === undefined) return true;
    const parsed = Number(value);
    return Number.isFinite(parsed) && Number.isInteger(parsed) && parsed > 0;
  }, "正の整数を入力してください。");

export const ingredientFormSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, "材料名を入力してください。"),
  amount: optionalNumberString,
  unit: z.string().trim().max(20).optional(),
  note: z.string().trim().max(120).optional(),
});

export const recipeFormSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, "料理名を入力してください。"),
  servings: z
    .coerce
    .number({ invalid_type_error: "人数には数値を入力してください。" })
    .int("人数は整数で入力してください。")
    .positive("人数は1以上で入力してください。"),
  dishType: dishTypeSchema,
  timeMinutes: optionalPositiveIntString,
  costRank: costRankSchema.optional().or(z.literal("")),
  instructions: z.string().optional(),
  sourceUrl: z
    .string()
    .url("URL形式で入力してください。")
    .optional()
    .or(z.literal("")),
  ingredients: z.array(ingredientFormSchema).min(1, "少なくとも1件の材料を追加してください。"),
});

export type IngredientFormValues = z.infer<typeof ingredientFormSchema>;
export type RecipeFormValues = z.infer<typeof recipeFormSchema>;
