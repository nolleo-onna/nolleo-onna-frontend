"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Eye, Trash2 } from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import { useHankkutPosts } from "@/features/hankkut/hooks/useHankkutPosts";

interface PostDetailProps {
  postId: string;
}

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(
    d.getDate(),
  ).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(
    d.getMinutes(),
  ).padStart(2, "0")}`;
}

/** 유저가 작성한 갤러리 글 상세 — localStorage(useHankkutPosts) 기반 */
export default function PostDetail({ postId }: PostDetailProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { posts, removePost, incrementViews } = useHankkutPosts();
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const post = posts.find((p) => p.id === postId);

  // 상세 진입당 1회만 조회수 증가 (리렌더/캐시 갱신으로 중복 집계 방지)
  const countedRef = useRef(false);
  useEffect(() => {
    if (countedRef.current || !post) return;
    countedRef.current = true;
    incrementViews(postId);
  }, [post, postId, incrementViews]);

  if (!post) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-[28px] border border-gray-100 bg-white px-6 py-20 text-center">
        <span className="text-3xl">🫥</span>
        <p className="text-[15px] font-semibold text-gray-700">글을 찾을 수 없어요</p>
        <p className="text-xs text-gray-400">
          삭제됐거나, 다른 브라우저에서 작성된 글일 수 있어요
        </p>
        <Link
          href="/hankkut"
          className="mt-1 rounded-full bg-navy-900 px-5 py-2.5 text-xs font-semibold text-lime-300 transition-transform active:scale-95"
        >
          한끗으로 돌아가기
        </Link>
      </div>
    );
  }

  const isAuthor = user?.userId === post.authorId;

  const handleDelete = () => {
    removePost(post.id);
    router.push(`/hankkut/region/${post.regionSlug}`);
  };

  return (
    <article className="rounded-[28px] border border-gray-100 bg-white p-6 md:p-8">
      <Link
        href={`/hankkut/region/${post.regionSlug}`}
        className="flex w-fit items-center gap-1 text-xs text-gray-400 transition-colors hover:text-gray-600"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        게시판으로
      </Link>

      <h1 className="mt-4 text-2xl font-bold leading-snug text-navy-900">
        {post.title}
      </h1>

      <div className="mt-3 flex items-center gap-3 border-b border-gray-100 pb-4 text-xs text-gray-400">
        <span className="font-semibold text-gray-600">{post.author}</span>
        <span>{formatDateTime(post.createdAt)}</span>
        <span className="flex items-center gap-1">
          <Eye className="h-3.5 w-3.5" />
          {post.views}
        </span>
        {isAuthor && (
          <span className="ml-auto">
            {confirmingDelete ? (
              <span className="flex items-center gap-2">
                <span className="text-gray-500">정말 삭제할까요?</span>
                <button
                  onClick={handleDelete}
                  className="font-semibold text-red-500 hover:underline"
                >
                  삭제
                </button>
                <button
                  onClick={() => setConfirmingDelete(false)}
                  className="text-gray-400 hover:underline"
                >
                  취소
                </button>
              </span>
            ) : (
              <button
                onClick={() => setConfirmingDelete(true)}
                className="flex items-center gap-1 text-gray-400 transition-colors hover:text-red-500"
              >
                <Trash2 className="h-3.5 w-3.5" />
                삭제
              </button>
            )}
          </span>
        )}
      </div>

      {post.imageDataUrl && (
        <Image
          src={post.imageDataUrl}
          alt=""
          width={800}
          height={600}
          unoptimized
          className="mt-5 h-auto w-full max-w-xl rounded-2xl border border-gray-100 object-contain"
        />
      )}

      <p className="mt-5 whitespace-pre-wrap text-[15px] leading-relaxed text-gray-700">
        {post.content}
      </p>
    </article>
  );
}
