"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ImageIcon, MessageSquare } from "lucide-react";

import { HANKKUT_GALLERIES } from "@/features/hankkut/data/galleries";
import { getExamplePosts, type ExamplePost } from "@/features/hankkut/data/examplePosts";
import { POST_CATEGORY_LABELS } from "@/features/hankkut/constants/postTags";
import {
  BOARD_PAGE_SIZE,
  RECENT_POSTS_WINDOW,
  useRecentRegionPosts,
  useRegionPosts,
} from "@/features/hankkut/hooks/usePosts";
import { sortByPopularity } from "@/features/hankkut/utils/hotIssues";

import type { PostDistrictTag, PostSummary } from "@/types/post";

type BoardTab = "latest" | "popular";

const TABS: { id: BoardTab; label: string }[] = [
  { id: "latest", label: "최신" },
  { id: "popular", label: "인기" },
];

interface RegionBoardListProps {
  regionSlug: string;
  regionName: string;
  districtTag: PostDistrictTag;
}

const ROW = "flex min-w-0 items-center gap-2.5 border-b border-gray-100 py-3";

function TagChip({ label, muted = false }: { label: string; muted?: boolean }) {
  return (
    <span
      className={`w-[4.5rem] shrink-0 truncate rounded px-1.5 py-0.5 text-center text-[11px] font-semibold ${
        muted ? "bg-gray-100 text-gray-400" : "bg-ocean-50 text-ocean-600"
      }`}
    >
      {label}
    </span>
  );
}

function BoardRow({ post }: { post: PostSummary }) {
  const tag = post.categoryTags[0];
  return (
    <li>
      <Link href={`/hankkut/post/${post.id}`} className={`group ${ROW}`}>
        <TagChip label={tag ? POST_CATEGORY_LABELS[tag] : "기타"} />
        <span className="min-w-0 truncate text-sm text-gray-800 transition-colors group-hover:text-ocean-600">
          {post.title}
        </span>
        {post.hasImage && <ImageIcon className="h-3.5 w-3.5 shrink-0 text-gray-300" />}
        {post.commentCount > 0 && (
          <span className="flex shrink-0 items-center gap-0.5 text-xs font-semibold text-pink-500">
            <MessageSquare className="h-3 w-3" />
            {post.commentCount}
          </span>
        )}
      </Link>
    </li>
  );
}

/** 서버에 글이 없을 때만 보여주는 예시 — 링크 없음, "예시" 칩으로 구분 */
function ExampleRow({ post }: { post: ExamplePost }) {
  return (
    <li className={`${ROW} opacity-70`}>
      <TagChip label="예시" muted />
      <span className="min-w-0 truncate text-sm text-gray-600">{post.title}</span>
    </li>
  );
}

/** 페이지 버튼은 현재 페이지 주변 5개만 — 글이 많아져도 한 줄에 담기게 */
function visiblePages(current: number, total: number, span = 5): number[] {
  const start = Math.max(0, Math.min(current - Math.floor(span / 2), total - span));
  return Array.from({ length: Math.min(span, total) }, (_, i) => start + i);
}

/**
 * 동네 화제글 — [최신]은 서버 페이지 그대로, [인기]는 최근 글 50개를 조회수순으로.
 * 서버가 기간·조회수 정렬을 지원하면 [인기]를 오늘/주간/월간으로 나눈다.
 */
export default function RegionBoardList({ regionSlug, regionName, districtTag }: RegionBoardListProps) {
  const [tab, setTab] = useState<BoardTab>("latest");
  const [page, setPage] = useState(0);
  const latest = useRegionPosts(districtTag, page);
  // 핫이슈와 같은 캐시라 탭을 눌러도 추가 요청이 없다
  const recent = useRecentRegionPosts(districtTag);

  const current = tab === "latest" ? latest : recent;
  const posts =
    tab === "latest"
      ? (latest.data?.content ?? [])
      : sortByPopularity(recent.data?.content ?? []).slice(0, BOARD_PAGE_SIZE);
  const totalElements = latest.data?.totalElements ?? recent.data?.totalElements ?? 0;
  const totalPages = tab === "latest" ? (latest.data?.totalPages ?? 0) : 0;
  // 백엔드는 구 단위로만 글을 나눠서, 같은 구의 동네끼리는 게시판을 함께 쓴다
  const sharedWith = HANKKUT_GALLERIES.filter(
    (g) => g.districtTag === districtTag && g.slug !== regionSlug,
  );
  // 아직 글이 없는 동네는 텅 비어 보이지 않게 예시 글로 채운다 — 첫 글이 올라오면 사라진다
  const examples =
    !current.isPending && !current.isError && totalElements === 0 ? getExamplePosts(districtTag) : [];

  return (
    <section>
      <div className="mb-3 flex items-baseline gap-2">
        <h2 className="text-lg font-bold text-navy-900">{regionName} 화제글</h2>
        {!latest.isPending && (
          <span className="text-xs tabular-nums text-gray-400">{totalElements}개의 글</span>
        )}
      </div>

      <div className="overflow-hidden rounded-[24px] border border-gray-100 bg-white">
        <div className="flex items-center gap-1 bg-navy-900 px-3 md:px-5">
          <div role="tablist" aria-label="화제글 정렬" className="flex">
            {TABS.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={tab === id}
                onClick={() => setTab(id)}
                className={`relative px-3 py-3.5 text-sm font-semibold transition-colors ${
                  tab === id ? "text-white" : "text-white/45 hover:text-white/75"
                }`}
              >
                {label}
                {tab === id && (
                  <span className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-lime-300" />
                )}
              </button>
            ))}
          </div>
          {tab === "popular" && (
            <span className="ml-auto text-[11px] text-white/45">
              최근 글 {RECENT_POSTS_WINDOW}개 중 조회수 순
            </span>
          )}
        </div>

        {sharedWith.length > 0 && (
          <p className="border-b border-gray-50 px-5 py-2 text-[11px] text-gray-400 md:px-7">
            {sharedWith.map((g) => g.name).join("·")} 한끗과 같은 게시판을 함께 써요
          </p>
        )}

        <div className="px-5 pb-2 md:px-7">
          {current.isPending ? (
            <ul className="grid grid-cols-1 md:grid-cols-2 md:gap-x-10">
              {Array.from({ length: 6 }, (_, i) => (
                <li key={i} className={ROW}>
                  <div className="animate-shimmer h-5 w-[4.5rem] rounded" />
                  <div className="animate-shimmer h-4 flex-1 rounded" />
                </li>
              ))}
            </ul>
          ) : current.isError ? (
            <p className="py-14 text-center text-sm text-gray-500">
              글 목록을 불러오지 못했어요. 잠시 후 다시 시도해주세요.
            </p>
          ) : posts.length === 0 ? (
            <>
              <div className="flex flex-col items-center gap-1.5 py-8 text-center">
                <span className="text-3xl">✍️</span>
                <p className="text-sm text-gray-500">아직 글이 없어요. 첫 글을 남겨보세요!</p>
                <p className="text-[11px] text-gray-400">
                  {examples.length > 0
                    ? "아래는 예시예요. 첫 글이 올라오면 사라져요"
                    : "이 지역에서 발견한 꿀팁, 후기, 질문 무엇이든 좋아요"}
                </p>
              </div>
              {examples.length > 0 && (
                <ul aria-label="예시 글" className="grid grid-cols-1 border-t border-dashed border-gray-100 md:grid-cols-2 md:gap-x-10">
                  {examples.map((post) => (
                    <ExampleRow key={post.title} post={post} />
                  ))}
                </ul>
              )}
            </>
          ) : (
            <ul
              className={`grid grid-cols-1 md:grid-cols-2 md:gap-x-10 ${
                tab === "latest" && latest.isPlaceholderData ? "opacity-60" : ""
              }`}
            >
              {posts.map((post) => (
                <BoardRow key={post.id} post={post} />
              ))}
            </ul>
          )}
        </div>

        {totalPages > 1 && (
          <nav
            aria-label="게시판 페이지"
            className="flex items-center justify-center gap-1.5 border-t border-gray-50 py-3"
          >
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page <= 0}
              aria-label="이전 페이지"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition-colors hover:bg-gray-50 disabled:opacity-30"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            {visiblePages(page, totalPages).map((n) => (
              <button
                key={n}
                onClick={() => setPage(n)}
                aria-current={n === page ? "page" : undefined}
                className={`h-8 w-8 rounded-full text-xs font-semibold transition-colors ${
                  n === page ? "bg-navy-900 text-lime-300" : "text-gray-500 hover:bg-gray-50"
                }`}
              >
                {n + 1}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              aria-label="다음 페이지"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition-colors hover:bg-gray-50 disabled:opacity-30"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </nav>
        )}
      </div>
    </section>
  );
}
