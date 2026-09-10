"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Eye, Pencil, ThumbsUp, Trash2 } from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import { getGalleryByDistrict } from "@/features/hankkut/data/galleries";
import { POST_CATEGORY_LABELS, POST_DISTRICT_LABELS } from "@/features/hankkut/constants/postTags";
import { useDeletePost, usePost, useTogglePostLike } from "@/features/hankkut/hooks/usePosts";
import { maskName } from "@/features/hankkut/utils/maskName";
import AuthorAvatar from "@/features/hankkut/components/AuthorAvatar";
import CommentSection from "@/features/hankkut/components/CommentSection";

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

function NotFound() {
  return (
    <div className="flex flex-col items-center gap-4 rounded-[28px] border border-gray-100 bg-white px-6 py-20 text-center">
      <span className="text-3xl">🫥</span>
      <p className="text-[15px] font-semibold text-gray-700">글을 찾을 수 없어요</p>
      <p className="text-xs text-gray-400">삭제됐거나 주소가 잘못됐을 수 있어요</p>
      <Link
        href="/hankkut"
        className="mt-1 rounded-full bg-navy-900 px-5 py-2.5 text-xs font-semibold text-lime-300 transition-transform active:scale-95"
      >
        한끗으로 돌아가기
      </Link>
    </div>
  );
}

/** 자유게시판 글 상세 — GET /posts/{id}. 서버가 진입마다 조회수를 올린다 */
export default function PostDetail({ postId }: PostDetailProps) {
  const router = useRouter();
  const { user } = useAuth();
  const numericId = /^\d+$/.test(postId) ? Number(postId) : null;
  const { data: post, isPending, isError } = usePost(numericId);
  const toggleLike = useTogglePostLike(numericId ?? 0);
  const removePost = useDeletePost();
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  if (numericId === null || isError) return <NotFound />;
  if (isPending || !post) return <div className="animate-shimmer h-96 rounded-[28px]" />;

  // 응답에 작성자 id가 없어 닉네임으로만 본인 글을 가린다. 잘못 열려도 서버가 403으로 막는다.
  const isAuthor = !!user && user.nickname === post.author.nickname;
  const gallery = getGalleryByDistrict(post.districtTag);
  const backHref = gallery ? `/hankkut/region/${gallery.slug}` : "/hankkut";
  const authorName = maskName(post.author.nickname);

  const handleDelete = () => {
    removePost.mutate(post.id, { onSuccess: () => router.push(backHref) });
  };

  return (
    <article className="rounded-[28px] border border-gray-100 bg-white p-6 md:p-8">
      <Link
        href={backHref}
        className="flex w-fit items-center gap-1 text-xs text-gray-400 transition-colors hover:text-gray-600"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        게시판으로
      </Link>

      <div className="mt-4 flex flex-wrap items-center gap-1.5">
        {post.districtTag && (
          <span className="rounded-full bg-navy-900 px-2.5 py-1 text-[11px] font-bold text-lime-300">
            {POST_DISTRICT_LABELS[post.districtTag]}
          </span>
        )}
        {post.categoryTags.map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-ocean-50 px-2.5 py-1 text-[11px] font-semibold text-ocean-600"
          >
            {POST_CATEGORY_LABELS[tag]}
          </span>
        ))}
      </div>

      <h1 className="mt-3 text-2xl font-bold leading-snug text-navy-900">{post.title}</h1>

      <div className="mt-3 flex items-center gap-2.5 border-b border-gray-100 pb-4">
        <AuthorAvatar
          name={authorName}
          imageUrl={post.author.profileImageUrl ?? undefined}
          size={32}
        />
        <div className="min-w-0 flex-1 text-xs text-gray-400">
          <span className="font-semibold text-gray-700">{authorName}</span>
          <div className="mt-0.5 flex items-center gap-2.5">
            <span>
              {formatDateTime(post.createdAt)}
              {post.updatedAt && post.updatedAt !== post.createdAt && " (수정됨)"}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="h-3.5 w-3.5" />
              {post.viewCount}
            </span>
          </div>
        </div>
        {isAuthor && (
          <div className="flex shrink-0 items-center gap-3 text-xs">
            <Link
              href={`/hankkut/post/${post.id}/edit`}
              className="flex items-center gap-1 text-gray-400 transition-colors hover:text-ocean-600"
            >
              <Pencil className="h-3.5 w-3.5" />
              수정
            </Link>
            {confirmingDelete ? (
              <span className="flex items-center gap-2">
                <span className="text-gray-500">정말 삭제할까요?</span>
                <button
                  onClick={handleDelete}
                  disabled={removePost.isPending}
                  className="font-semibold text-red-500 hover:underline disabled:opacity-50"
                >
                  {removePost.isPending ? "삭제 중" : "삭제"}
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
          </div>
        )}
      </div>

      {removePost.isError && (
        <p role="alert" className="mt-3 rounded-xl bg-red-50 px-4 py-2.5 text-xs font-medium text-red-500">
          {removePost.error.message}
        </p>
      )}

      {post.imageUrls.length > 0 && (
        <div className="mt-5 flex flex-col gap-3">
          {post.imageUrls.map((url) => (
            // 업로드 저장소 도메인이 next.config에 없어 최적화 없이 그대로 띄운다
            <Image
              key={url}
              src={url}
              alt=""
              width={800}
              height={600}
              unoptimized
              className="h-auto w-full max-w-xl rounded-2xl border border-gray-100 object-contain"
            />
          ))}
        </div>
      )}

      <p className="mt-5 whitespace-pre-wrap text-[15px] leading-relaxed text-gray-700">
        {post.content}
      </p>

      <div className="mt-6 flex items-center gap-2">
        <button
          type="button"
          onClick={() => toggleLike.mutate()}
          disabled={!user || toggleLike.isPending}
          aria-pressed={post.isLiked}
          className={`flex items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
            post.isLiked
              ? "border-ocean-400 bg-ocean-50 text-ocean-600"
              : "border-gray-200 text-gray-500 hover:border-gray-300"
          }`}
        >
          <ThumbsUp className="h-3.5 w-3.5" />
          좋아요 {post.likeCount}
        </button>
        {!user && (
          <span className="text-[11px] text-gray-400">
            <Link href="/login" className="font-semibold text-ocean-600 hover:underline">
              로그인
            </Link>
            하면 좋아요를 누를 수 있어요
          </span>
        )}
      </div>

      <CommentSection postId={post.id} commentCount={post.commentCount} />
    </article>
  );
}
