import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { AppProviders } from "@/components/providers/app-providers";
import { cn } from "@/lib/utils";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "レシピ保存＆献立自動提案サービス",
  description:
    "家庭の自炊を支援するレシピ保存と献立自動提案（主菜+副菜）を提供するWebサービスのMVP",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body className={cn(geistSans.variable, geistMono.variable, "antialiased min-h-screen")}>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
