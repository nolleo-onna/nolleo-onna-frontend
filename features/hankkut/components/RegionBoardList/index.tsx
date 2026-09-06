"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  ImageIcon,
  MessageSquarePlus,
  ThumbsUp,
} from "lucide-react";

import {
  selectRegionPosts,
  useHankkutPosts,
  type HankkutPost,
} from "@/features/hankkut/hooks/useHankkutPosts";
import { useHankkutVotes } from "@/features/hankkut/hooks/useHankkutVotes";
import { useAuth } from "@/hooks/useAuth";
import AuthorAvatar from "@/features/hankkut/components/AuthorAvatar";

interface RegionBoardListProps {
  regionSlug: string;
}

const PAGE_SIZE = 10;

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

function BoardRow({ post }: { post: HankkutPost }) {
  const { user } = useAuth();
  const { likeCount } = useHankkutVotes(post.id, user?.userId);

  return (
    <Link
      href={`/hankkut/post/${post.id}`}
      className="flex items-center gap-3 px-6 py-3.5 transition-colors hover:bg-gray-50/70"
    >
      <AuthorAvatar name={post.author} size={32} />
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-1.5 truncate text-sm font-semibold text-gray-900">
          <span className="truncate">{post.title}</span>
          {post.imageDataUrl && (
            <ImageIcon className="h-3.5 w-3.5 shrink-0 text-gray-300" />
          )}
        </p>
        <p className="mt-0.5 flex items-center gap-2 text-[11px] text-gray-400">
          <span className="font-medium text-gray-500">{post.author}</span>
          <span>{formatDate(post.createdAt)}</span>
          <span className="flex items-center gap-0.5">
            <Eye className="h-3 w-3" />
            {post.views}
          </span>
          {likeCount > 0 && (
            <span className="flex items-center gap-0.5 text-ocean-500">
              <ThumbsUp className="h-3 w-3" />
              {likeCount}
            </span>
          )}
        </p>
      </div>
      <ChevronRight className="h-4 w-4 shrink-0 text-gray-200" />
    </Link>
  );
}

/** 지역 갤러리 자유게시판 목록 — 글은 localStorage(useHankkutPosts)에 저장된다 */
export default function RegionBoardList({ regionSlug }: RegionBoardListProps) {
  const { posts } = useHankkutPosts();
  const regionPosts = selectRegionPosts(posts, regionSlug);
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(regionPosts.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const visible = regionPosts.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return (
    <section className="rounded-[28px] border border-gray-100 bg-white">
      {/* 헤더 */}
      <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-bold text-navy-900">자유게시판</h2>
          <span className="text-xs tabular-nums text-gray-400">
            {regionPosts.length}개의 글
          </span>
        </div>
        <Link
          href={`/hankkut/region/${regionSlug}/write`}
          className="flex items-center gap-1.5 rounded-full bg-navy-900 px-4 py-2 text-xs font-semibold text-lime-300 transition-transform hover:-translate-y-0.5 active:scale-95"
        >
          <MessageSquarePlus className="h-3.5 w-3.5" />
          글쓰기
        </Link>
      </div>

      {/* 목록 */}
      {regionPosts.length === 0 ? (
        <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
          <span className="text-3xl">✍️</span>
          <p className="text-sm text-gray-500">아직 글이 없어요. 첫 글을 남겨보세요!</p>
          <p className="text-[11px] text-gray-400">
            이 지역에서 발견한 꿀팁, 후기, 질문 무엇이든 좋아요
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-gray-50">
          {visible.map((post) => (
            <li key={post.id}>
              <BoardRow post={post} />
            </li>
          ))}
        </ul>
      )}

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <nav
          aria-label="게시판 페이지"
          className="flex items-center justify-center gap-1.5 border-t border-gray-50 py-3"
        >
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={safePage <= 1}
            aria-label="이전 페이지"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition-colors hover:bg-gray-50 disabled:opacity-30"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              onClick={() => setPage(n)}
              aria-current={n === safePage ? "page" : undefined}
              className={`h-8 w-8 rounded-full text-xs font-semibold transition-colors ${
                n === safePage
                  ? "bg-navy-900 text-lime-300"
                  : "text-gray-500 hover:bg-gray-50"
              }`}
            >
              {n}
            </button>
          ))}
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={safePage >= totalPages}
            aria-label="다음 페이지"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition-colors hover:bg-gray-50 disabled:opacity-30"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </nav>
      )}
    </section>
  );
}
