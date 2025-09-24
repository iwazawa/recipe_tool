import type { Metadata } from "next";
import Link from "next/link";

import { SignInForm } from "@/app/(auth)/_components/sign-in-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "ログイン | 献立アシスタント",
};

export default function LoginPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>ログイン</CardTitle>
        <CardDescription>
          登録済みのメールアドレスとパスワードでサインインしてください。
        </CardDescription>
      </CardHeader>
      <CardContent>
        <SignInForm />
        <p className="mt-6 text-center text-sm text-muted-foreground">
          アカウントをお持ちでない場合は{" "}
          <Link href="/signup" className="text-primary underline-offset-2 hover:underline">
            新規登録
          </Link>
          へ。
        </p>
      </CardContent>
    </Card>
  );
}
