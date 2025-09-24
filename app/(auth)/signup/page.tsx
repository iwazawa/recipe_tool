import type { Metadata } from "next";
import Link from "next/link";

import { SignUpForm } from "@/app/(auth)/_components/sign-up-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "新規登録 | 献立アシスタント",
};

export default function SignUpPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>アカウント作成</CardTitle>
        <CardDescription>
          メールアドレスとパスワードを設定して、献立支援サービスを利用開始しましょう。
        </CardDescription>
      </CardHeader>
      <CardContent>
        <SignUpForm />
        <p className="mt-6 text-center text-sm text-muted-foreground">
          すでにアカウントをお持ちの場合は{" "}
          <Link href="/login" className="text-primary underline-offset-2 hover:underline">
            ログイン
          </Link>
          してください。
        </p>
      </CardContent>
    </Card>
  );
}
