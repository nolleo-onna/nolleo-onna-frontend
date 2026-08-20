"use client";

import { Flame, PenLine } from "lucide-react";
import Link from "next/link";

import HankkutList from "@/features/hankkut/components/HankkutList";
import { selectRegionPosts, useHankkutPosts } from "@/features/hankkut/hooks/useHankkutPosts";
import { buildWeeklyBest } from "@/features/hankkut/utils/weeklyBestFeed";

import type { Hankkut } from "@/features/hankkut/data/mockHankkut";
import type { HankkutGallery } from "@/features/hankkut/data/galleries";

interface RegionWeeklyBestProps {
  gallery: HankkutGallery;
  /** 이 갤러리의 큐레이션 한끗 전체(정렬 전) — 자유게시판 글과 합쳐 조회수 순으로 재정렬한다 */
  curatedPosts: Hankkut[];
}

// 갤러리(지역) 상세의 "이번 주 베스트" — 큐레이션 한끗과 자유게시판 글을
// 합쳐 조회수 순으로 보여준다. 큐레이션만 보던 예전 버전은 자유게시판에
// 아무리 글이 쌓여도 베스트에 안 잡혀서 카드가 안 채워지는 문제가 있었다.
export default function RegionWeeklyBest({ gallery, curatedPosts }: RegionWeeklyBestProps) {
  const { posts: boardPosts } = useHankkutPosts();
  const regionBoardPosts = selectRegionPosts(boardPosts, gallery.slug);
  const items = buildWeeklyBest(curatedPosts, regionBoardPosts);

  return (
    <section>
      <div className="mb-4 flex items-center gap-2">
        <Flame className="h-5 w-5 text-pink-500" />
        <h2 className="text-lg font-bold text-navy-900">이번 주 베스트</h2>
      </div>

      {items.length === 0 ? (
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
        <HankkutList items={items} />
      )}
    </section>
  );
}
