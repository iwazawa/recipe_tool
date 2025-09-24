import { z } from "zod";

export const emailSchema = z.string().email("有効なメールアドレスを入力してください。");
export const passwordSchema = z
  .string()
  .min(6, "パスワードは6文字以上で入力してください。");

export const signInSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const signUpSchema = signInSchema.extend({
  displayName: z
    .string()
    .min(1, "表示名を入力してください。")
    .max(50, "表示名は50文字以内で入力してください。"),
});

export type SignInInput = z.infer<typeof signInSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
