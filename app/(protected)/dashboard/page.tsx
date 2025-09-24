import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="space-y-10">
      <section className="rounded-3xl border border-border/60 bg-card/80 p-8 shadow-lg shadow-primary/5">
        <div className="space-y-2">
          <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            Overview
          </span>
          <h1 className="text-3xl font-semibold">ダッシュボード</h1>
          <p className="text-sm text-muted-foreground">
            登録済みレシピや最新の献立提案にアクセスできます。まずはレシピを登録し、献立の自動提案を試してみましょう。
          </p>
        </div>
        <div className="mt-6 grid gap-3 text-xs text-muted-foreground sm:grid-cols-3">
          <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
            <p className="font-semibold text-foreground">今日の献立</p>
            <p className="mt-1 leading-5">
              主菜と副菜をワンクリックで生成。生成時に買い物リストが自動で紐づきます。
            </p>
          </div>
          <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
            <p className="font-semibold text-foreground">週間献立</p>
            <p className="mt-1 leading-5">
              一週間分の重複しない献立を作成し、まとめ買いに最適な集約リストを取得。
            </p>
          </div>
          <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
            <p className="font-semibold text-foreground">レシピ管理</p>
            <p className="mt-1 leading-5">
              主菜・副菜の分類で検索しやすく、材料も柔軟に追加・編集できます。
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-6 sm:grid-cols-2">
        <FeatureCard
          title="今日の献立を提案"
          description="主菜と副菜をランダムに選んで今日の献立を作成します。買い物リストも自動生成。"
          href="/menu/today"
          variant="primary"
          cta="今日の献立ページへ"
        />
        <FeatureCard
          title="1週間の献立を提案"
          description="7日分の主菜と副菜を重複なく提案し、まとめ買いリストを生成します。"
          href="/menu/week"
          variant="outline"
          cta="週間献立ページへ"
        />
        <FeatureCard
          title="レシピを管理"
          description="レシピの登録・編集・削除ができます。主菜/副菜ごとのフィルタも利用可能。"
          href="/recipes"
          variant="outline"
          cta="レシピ一覧へ"
        />
        <FeatureCard
          title="買い物リストを確認"
          description="生成した献立には材料がまとめられた買い物リストが付属します。提案ページから確認できます。"
          href="/menu/today"
          variant="outline"
          cta="買い物リストを確認"
        />
      </div>
    </div>
  );
}

function FeatureCard({
  title,
  description,
  href,
  cta,
  variant = "outline",
}: {
  title: string;
  description: string;
  href: string;
  cta: string;
  variant?: "primary" | "outline";
}) {
  const isPrimary = variant === "primary";

  return (
    <div className="space-y-4 rounded-3xl border border-border/60 bg-card/80 p-6 shadow-md shadow-primary/5">
      <div className="space-y-2">
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <Link
        href={href}
        className={
          isPrimary
            ? "inline-flex h-10 items-center justify-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition hover:opacity-90"
            : "inline-flex h-10 items-center justify-center rounded-full border border-border/70 px-5 text-sm font-semibold text-foreground transition hover:border-primary/60 hover:text-primary"
        }
      >
        {cta}
      </Link>
    </div>
  );
}
