import { Flame } from "lucide-react";

import HankkutList from "@/features/hankkut/components/HankkutList";

import type { Hankkut } from "@/features/hankkut/data/mockHankkut";

interface RegionWeeklyBestProps {
  posts: Hankkut[];
}

// 갤러리(지역) 상세의 "이번 주 베스트" — 기존 한끗 홈 그리드(HankkutList/
// HankkutCard)를 그대로 재사용해 디자인을 통일한다.
export default function RegionWeeklyBest({ posts }: RegionWeeklyBestProps) {
  return (
    <section>
      <div className="mb-4 flex items-center gap-2">
        <Flame className="h-5 w-5 text-pink-500" />
        <h2 className="text-lg font-bold text-navy-900">이번 주 베스트</h2>
      </div>
      <HankkutList list={posts} />
    </section>
  );
}
