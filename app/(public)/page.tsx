import Link from "next/link";

const featureSummaries = [
  {
    title: "レシピ管理",
    description:
      "主菜/副菜・人数・材料・手順を保存できるCRUDとフォームバリデーションを備えています。",
    accent: "bg-gradient-to-r from-primary/80 to-primary",
  },
  {
    title: "献立自動提案",
    description:
      "登録済みレシピから主菜+副菜をランダムに選び、今日・1週間どちらの献立も数クリックで生成できます。",
    accent: "bg-gradient-to-r from-accent/70 to-primary/70",
  },
  {
    title: "買い物リスト集約",
    description:
      "提案された献立の材料を重複集約し、単位ごとに合計した買い物リストを自動で用意します。",
    accent: "bg-gradient-to-r from-secondary/70 to-accent/80",
  },
];

export default function Home() {
  return (
    <main className="relative mx-auto flex w-full max-w-6xl flex-col gap-16 px-6 py-20">
      <section className="relative overflow-hidden rounded-3xl border border-border/60 bg-background/80 p-10 shadow-lg shadow-primary/5 backdrop-blur">
        <div className="relative z-10 flex flex-col gap-6 sm:max-w-3xl">
          <span className="inline-flex w-fit items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            レシピ保存 & 献立自動提案 MVP
          </span>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            家庭の献立づくりを、
            <br className="hidden sm:block" />
            もっとスムーズに。
          </h1>
          <p className="text-base leading-relaxed text-muted-foreground">
            Next.js と Supabase をベースに、認証・レシピ管理・献立自動提案・買い物リスト生成まで
            MVP に必要なフローをすべてカバー。すぐにチーム開発や本番運用へ拡張できる土台です。
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/dashboard"
              className="group inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition hover:opacity-90"
            >
              ダッシュボードを開く
              <span className="transition group-hover:translate-x-0.5">→</span>
            </Link>
            <Link
              href="/menu/today"
              className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background px-5 py-3 text-sm font-semibold text-foreground transition hover:border-primary/60 hover:text-primary"
            >
              今日の献立を生成
            </Link>
            <Link
              href="/recipes"
              className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background px-5 py-3 text-sm font-semibold text-foreground transition hover:border-primary/60 hover:text-primary"
            >
              レシピを登録
            </Link>
          </div>
        </div>

        <div className="pointer-events-none absolute right-0 top-0 h-full w-1/2 opacity-40 sm:opacity-60">
          <div className="absolute inset-0 rounded-l-3xl bg-[radial-gradient(circle_at_top,theme(colors.primary/30),transparent_55%)]" />
          <div className="absolute inset-y-6 inset-x-10 hidden rounded-3xl border border-border/40 bg-card/40 backdrop-blur xl:block" />
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        {featureSummaries.map((feature) => (
          <div
            key={feature.title}
            className="group relative overflow-hidden rounded-3xl border border-border/60 bg-card/90 p-6 shadow-lg shadow-primary/5 transition hover:-translate-y-1 hover:shadow-primary/10"
          >
            <span
              className={`pointer-events-none absolute inset-x-6 top-6 h-10 rounded-full opacity-25 ${feature.accent}`}
            />
            <div className="relative space-y-3">
              <h2 className="text-lg font-semibold text-foreground">{feature.title}</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
            </div>
          </div>
        ))}
      </section>

      <section className="grid gap-6 rounded-3xl border border-dashed border-border/70 bg-secondary/40 p-8 shadow-inner shadow-secondary/20 md:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-3">
          <h3 className="text-base font-semibold text-foreground">次のステップ（推奨）</h3>
          <ol className="list-inside list-decimal space-y-1 text-sm leading-6 text-muted-foreground">
            <li>Supabase プロジェクトにマイグレーションを適用し、環境変数を設定して実データで動作確認する</li>
            <li>Vitest / Playwright などで認証〜献立提案までのユースケースを自動テスト化する</li>
            <li>Vercel + Supabase へのデプロイと監視設定を行い、運用フローを整備する</li>
          </ol>
        </div>
        <div className="space-y-3 rounded-2xl border border-border/60 bg-card/70 p-6 text-sm leading-6 text-muted-foreground">
          <h4 className="text-sm font-semibold text-foreground">デザイン変更について</h4>
          <p>
            このページではスタイルにアクセントを追加しています。元の雰囲気に戻したい場合は
            Git の差分で `app/(public)/page.tsx` を確認し、必要に応じて変更を打ち消すだけで以前のデザインに戻せます。
          </p>
        </div>
      </section>
    </main>
  );
}
