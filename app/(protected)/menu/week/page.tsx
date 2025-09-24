import type { Metadata } from "next";

import { MenuSuggestion } from "@/app/(protected)/menu/_components/menu-suggestion";

export const metadata: Metadata = {
  title: "週間献立提案 | 献立アシスタント",
};

export default function MenuWeekPage() {
  return (
    <div className="space-y-8">
      <MenuSuggestion scope="week" />
    </div>
  );
}
