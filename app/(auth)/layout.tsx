import type { ReactNode } from "react";

import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <header className="border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-4xl items-center justify-between px-6 py-4 text-sm">
          <Link href="/" className="font-semibold">
            献立アシスタント
          </Link>
          <Link href="/login" className="text-muted-foreground hover:text-foreground">
            ログイン
          </Link>
        </div>
      </header>
      <main className="flex flex-1 items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}
