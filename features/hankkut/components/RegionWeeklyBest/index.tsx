import { Flame, PenLine } from "lucide-react";
import Link from "next/link";

import HankkutList from "@/features/hankkut/components/HankkutList";

import type { Hankkut } from "@/features/hankkut/data/mockHankkut";
import type { HankkutGallery } from "@/features/hankkut/data/galleries";

interface RegionWeeklyBestProps {
  gallery: HankkutGallery;
  posts: Hankkut[];
}

// 갤러리(지역) 상세의 "이번 주 베스트" — 기존 한끗 홈 그리드(HankkutList/
// HankkutCard)를 그대로 재사용해 디자인을 통일한다. 글이 아직 없는 동네는
// HankkutList의 범용 빈 상태 대신, 그 동네만의 이모지 + 글쓰기 CTA로 채운다.
export default function RegionWeeklyBest({ gallery, posts }: RegionWeeklyBestProps) {
  return (
    <section>
      <div className="mb-4 flex items-center gap-2">
        <Flame className="h-5 w-5 text-pink-500" />
        <h2 className="text-lg font-bold text-navy-900">이번 주 베스트</h2>
      </div>

      {posts.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-[28px] border border-dashed border-gray-200 bg-gradient-to-br from-ocean-50/50 to-lime-50/40 px-6 py-16 text-center">
          <span aria-hidden className="text-5xl">
            {gallery.emoji}
          </span>
          <div>
            <p className="text-base font-bold text-gray-700">
              아직 {gallery.name} 한끗이 없어요
            </p>
            <p className="mt-1 text-sm text-gray-400">
              이 동네에서 발견한 정보를 가장 먼저 남겨보세요
            </p>
          </div>
          <Link
            href={`/hankkut/region/${gallery.slug}/write`}
            className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-navy-900 px-5 py-2.5 text-sm font-semibold text-lime-300 transition-transform hover:-translate-y-0.5"
          >
            <PenLine className="h-4 w-4" />
            첫 글 쓰기
          </Link>
        </div>
      ) : (
        <HankkutList list={posts} />
      )}
    </section>
  );
}
