"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  ImageIcon,
  MessageCircle,
  MessageSquarePlus,
  ThumbsUp,
} from "lucide-react";

import { HANKKUT_GALLERIES } from "@/features/hankkut/data/galleries";
import { BOARD_PAGE_SIZE, useRegionPosts } from "@/features/hankkut/hooks/usePosts";
import { maskName } from "@/features/hankkut/utils/maskName";
import AuthorAvatar from "@/features/hankkut/components/AuthorAvatar";

import type { PostDistrictTag, PostSummary } from "@/types/post";

interface RegionBoardListProps {
  regionSlug: string;
  districtTag: PostDistrictTag;
}

function formatDate(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const sameDay =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();
  if (sameDay) {
    return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
  }
  return `${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")}`;
}

function BoardRow({ post }: { post: PostSummary }) {
  const authorName = maskName(post.author.nickname);
  return (
    <Link
      href={`/hankkut/post/${post.id}`}
      className="flex items-center gap-3 px-6 py-3.5 transition-colors hover:bg-gray-50/70"
    >
      <AuthorAvatar name={authorName} size={32} />
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-1.5 truncate text-sm font-semibold text-gray-900">
          <span className="truncate">{post.title}</span>
          {post.hasImage && <ImageIcon className="h-3.5 w-3.5 shrink-0 text-gray-300" />}
        </p>
        <p className="mt-0.5 flex items-center gap-2 text-[11px] text-gray-400">
          <span className="font-medium text-gray-500">{authorName}</span>
          <span>{formatDate(post.createdAt)}</span>
          <span className="flex items-center gap-0.5">
            <Eye className="h-3 w-3" />
            {post.viewCount}
          </span>
          {post.likeCount > 0 && (
            <span className="flex items-center gap-0.5 text-ocean-500">
              <ThumbsUp className="h-3 w-3" />
              {post.likeCount}
            </span>
          )}
          {post.commentCount > 0 && (
            <span className="flex items-center gap-0.5">
              <MessageCircle className="h-3 w-3" />
              {post.commentCount}
            </span>
          )}
        </p>
      </div>
      <ChevronRight className="h-4 w-4 shrink-0 text-gray-200" />
    </Link>
  );
}

/** 페이지 버튼은 현재 페이지 주변 5개만 — 글이 많아져도 한 줄에 담기게 */
function visiblePages(current: number, total: number, span = 5): number[] {
  const start = Math.max(0, Math.min(current - Math.floor(span / 2), total - span));
  return Array.from({ length: Math.min(span, total) }, (_, i) => start + i);
}

/** 지역 갤러리 자유게시판 목록 — 서버(GET /posts?district=)에서 페이지 단위로 받는다 */
export default function RegionBoardList({ regionSlug, districtTag }: RegionBoardListProps) {
  const [page, setPage] = useState(0);
  const { data, isPending, isError, isPlaceholderData } = useRegionPosts(districtTag, page);

  const posts = data?.content ?? [];
  const totalPages = data?.totalPages ?? 0;
  const totalElements = data?.totalElements ?? 0;
  // 백엔드는 구 단위로만 글을 나눠서, 같은 구의 동네끼리는 게시판을 함께 쓴다
  const sharedWith = HANKKUT_GALLERIES.filter(
    (g) => g.districtTag === districtTag && g.slug !== regionSlug,
  );

  return (
    <section className="rounded-[28px] border border-gray-100 bg-white">
      <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-bold text-navy-900">자유게시판</h2>
          {!isPending && (
            <span className="text-xs tabular-nums text-gray-400">{totalElements}개의 글</span>
          )}
        </div>
        <Link
          href={`/hankkut/region/${regionSlug}/write`}
          className="flex items-center gap-1.5 rounded-full bg-navy-900 px-4 py-2 text-xs font-semibold text-lime-300 transition-transform hover:-translate-y-0.5 active:scale-95"
        >
          <MessageSquarePlus className="h-3.5 w-3.5" />
          글쓰기
        </Link>
      </div>

      {sharedWith.length > 0 && (
        <p className="border-b border-gray-50 px-6 py-2 text-[11px] text-gray-400">
          {sharedWith.map((g) => g.name).join("·")} 한끗과 같은 게시판을 함께 써요
        </p>
      )}

      {isPending ? (
        <ul className="divide-y divide-gray-50">
          {Array.from({ length: 4 }, (_, i) => (
            <li key={i} className="flex items-center gap-3 px-6 py-3.5">
              <div className="animate-shimmer h-8 w-8 rounded-full" />
              <div className="flex-1 space-y-1.5">
                <div className="animate-shimmer h-3.5 w-2/3 rounded" />
                <div className="animate-shimmer h-3 w-1/3 rounded" />
              </div>
            </li>
          ))}
        </ul>
      ) : isError ? (
        <div className="flex flex-col items-center gap-2 px-6 py-16 text-center">
          <p className="text-sm text-gray-500">글 목록을 불러오지 못했어요</p>
          <p className="text-[11px] text-gray-400">잠시 후 다시 시도해주세요</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
          <span className="text-3xl">✍️</span>
          <p className="text-sm text-gray-500">아직 글이 없어요. 첫 글을 남겨보세요!</p>
          <p className="text-[11px] text-gray-400">
            이 지역에서 발견한 꿀팁, 후기, 질문 무엇이든 좋아요
          </p>
        </div>
      ) : (
        <ul className={`divide-y divide-gray-50 ${isPlaceholderData ? "opacity-60" : ""}`}>
          {posts.map((post) => (
            <li key={post.id}>
              <BoardRow post={post} />
            </li>
          ))}
        </ul>
      )}

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
      <span className="sr-only">페이지당 {BOARD_PAGE_SIZE}개</span>
    </section>
  );
}
