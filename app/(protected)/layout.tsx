import type { ReactNode } from "react";

import Link from "next/link";
import { redirect } from "next/navigation";

import { signOutAction } from "@/lib/auth/actions";
import { getSupabaseServerClient } from "@/lib/supabase/server";

import { Button } from "@/components/ui/button";

export default async function ProtectedLayout({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = getSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    console.error("Auth error", error.message);
  }

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", user.id)
    .maybeSingle();

  const navLinks = [
    { href: "/dashboard", label: "ダッシュボード" },
    { href: "/recipes", label: "レシピ" },
    { href: "/menu/today", label: "今日の献立" },
    { href: "/menu/week", label: "週間献立" },
  ] as const;

  return (
    <div className="min-h-screen bg-muted/20">
      <header className="sticky top-0 z-20 border-b border-border/70 bg-background/80 shadow-sm shadow-primary/5 backdrop-blur">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="text-lg font-semibold text-foreground">
              献立アシスタント
            </Link>
            <nav className="hidden items-center gap-4 text-sm sm:flex">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-full px-3 py-1 text-muted-foreground transition hover:bg-primary/10 hover:text-primary"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="rounded-full bg-secondary/70 px-3 py-1 text-muted-foreground">
              {profile?.display_name ?? user.email}
            </span>
            <form action={signOutAction}>
              <Button type="submit" variant="outline" size="sm" className="rounded-full px-4">
                ログアウト
              </Button>
            </form>
          </div>
          <nav className="flex items-center gap-3 text-sm text-muted-foreground sm:hidden">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-full px-3 py-1 transition hover:bg-primary/10 hover:text-primary"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl px-6 py-12 sm:py-14">{children}</main>
    </div>
  );
}
