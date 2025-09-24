# レシピ保存＆献立自動提案サービス (MVP)

Next.js (App Router) + Supabase をベースにした家庭向け献立支援サービスのMVPプロジェクトです。Email/Password 認証、レシピ CRUD、献立自動提案（今日/1週間）と買い物リスト集約まで一通り実装済みの状態から開発を始められます。

## 技術スタック

- Next.js 15 (App Router, TypeScript, Tailwind v4)
- Supabase (Auth / PostgreSQL / Storage)
- shadcn/ui コンポーネント基盤
- TanStack Query, React Hook Form + Zod

## セットアップ

1. 依存パッケージをインストールします。
   ```bash
   npm install
   ```
2. 環境変数を設定します。
   - `.env.example` をコピーして `.env.local` を作成し、Supabase プロジェクトの URL/キーを入力してください。
   - サーバーアクション／Route Handler で Service Role Key を利用する場合は `SUPABASE_SERVICE_ROLE_KEY` も設定します。
3. 開発サーバーを起動します。
   ```bash
   npm run dev
   ```
4. [http://localhost:3000](http://localhost:3000) へアクセスするとセットアップ済みのマーケティングページや `/login` の認証 UI を確認できます。

## Supabase 初期化

Supabase プロジェクトを作成し、`supabase/migrations/0001_initial.sql` を SQL Editor などで適用してください。RLS ポリシーを含むスキーマの一括適用が可能です。初期データ投入が必要な場合は設計書付録のサンプル SQL を活用できます。

`lib/supabase/types.ts` には上記スキーマに対応した TypeScript 型を定義しているため、`supabase` CLI の `gen types` を利用する際のテンプレートとして活用できます。

## ディレクトリ構成 (抜粋)

```
app/(public)/            認証不要のページ（トップページなど）
app/(auth)/              ログイン/サインアップ用 UI
app/(protected)/         認証必須のダッシュボード・レシピ・献立画面
app/api/                 Supabase RLS を利用する API Route
components/ui/           shadcn/ui のコンポーネント群
lib/auth/                認証用サーバーアクションとバリデーション
lib/recipes/             レシピ用スキーマ・型・API クライアント
lib/menus/               献立提案ロジック・型定義
lib/env.ts               環境変数ユーティリティ
lib/supabase/            Supabase クライアント (server / browser / types)
supabase/migrations/     スキーマ・RLS の SQL
```

## 次の実装ステップ例

1. Supabase プロジェクトにマイグレーションを適用し、環境変数を設定して実データで動作確認する
2. Vitest / Playwright などで認証〜献立提案までのユースケースを自動テスト化する
3. Vercel + Supabase へのデプロイと監視設定を行い、運用フローを整備する

プロジェクト全体の要件やスキーマは `docs/` 等へ移すことを想定していますが、現時点では設計書を参照しながら開発を進めてください。
