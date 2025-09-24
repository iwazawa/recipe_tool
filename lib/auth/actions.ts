"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getSupabaseServerClient } from "@/lib/supabase/server";

import { signInSchema, signUpSchema, type SignInInput, type SignUpInput } from "./schemas";

type ActionResult = {
  success: boolean;
  message?: string;
};

function handleActionSuccess(path?: string): ActionResult {
  if (path) {
    redirect(path);
  }

  return { success: true };
}

export async function signInWithPasswordAction(values: SignInInput): Promise<ActionResult> {
  const supabase = getSupabaseServerClient();
  let parsedValues: SignInInput;

  try {
    parsedValues = signInSchema.parse(values);
  } catch {
    return { success: false, message: "入力内容を確認してください。" };
  }

  const { email, password } = parsedValues;
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { success: false, message: error.message };
  }

  revalidatePath("/", "layout");
  revalidatePath("/dashboard");

  return handleActionSuccess("/dashboard");
}

export async function signUpWithPasswordAction(values: SignUpInput): Promise<ActionResult> {
  const supabase = getSupabaseServerClient();
  let parsedValues: SignUpInput;

  try {
    parsedValues = signUpSchema.parse(values);
  } catch {
    return { success: false, message: "入力内容を確認してください。" };
  }

  const { email, password, displayName } = parsedValues;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { display_name: displayName },
    },
  });

  if (error) {
    return { success: false, message: error.message };
  }

  const user = data.user;

  if (user) {
    const { error: profileError } = await supabase
      .from("profiles")
      .upsert({ id: user.id, display_name: displayName });

    if (profileError) {
      return { success: false, message: profileError.message };
    }
  }

  revalidatePath("/", "layout");
  revalidatePath("/dashboard");

  return handleActionSuccess("/dashboard");
}

export async function signOutAction(): Promise<ActionResult> {
  const supabase = getSupabaseServerClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    return { success: false, message: error.message };
  }

  revalidatePath("/", "layout");
  revalidatePath("/dashboard");

  return handleActionSuccess("/login");
}
