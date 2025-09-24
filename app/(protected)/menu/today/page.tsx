import type { Metadata } from "next";

import { MenuSuggestion } from "@/app/(protected)/menu/_components/menu-suggestion";

export const metadata: Metadata = {
  title: "今日の献立提案 | 献立アシスタント",
};

export default function MenuTodayPage() {
  return (
    <div className="space-y-8">
      <MenuSuggestion scope="today" />
    </div>
  );
}
