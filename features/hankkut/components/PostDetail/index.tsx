"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Eye,
  MessageCircle,
  Pencil,
  ThumbsUp,
  Trash2,
  X,
} from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import { getGalleryByDistrict } from "@/features/hankkut/data/galleries";
import { POST_CATEGORY_LABELS, POST_DISTRICT_LABELS } from "@/features/hankkut/constants/postTags";
import { useDeletePost, usePost, useTogglePostLike } from "@/features/hankkut/hooks/usePosts";
import { maskName } from "@/features/hankkut/utils/maskName";
import { isEdited } from "@/features/hankkut/utils/isEdited";
import AuthorAvatar from "@/features/hankkut/components/AuthorAvatar";
import CommentSection from "@/features/hankkut/components/CommentSection";

interface PostDetailProps {
  postId: string;
}

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

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

/** 첨부 사진 — 한 장은 원본 비율 그대로, 여러 장은 격자로. 누르면 크게 보고 좌우 화살표·키보드로 넘긴다 */
function PostImages({ urls }: { urls: string[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const close = useCallback(() => setOpenIndex(null), []);
  const step = useCallback(
    (direction: 1 | -1) =>
      setOpenIndex((i) => (i === null ? i : (i + direction + urls.length) % urls.length)),
    [urls.length],
  );

  useEffect(() => {
    if (openIndex === null) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKey);
    return () => {
      window.removeEventListener("keydown", handleKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [openIndex, close, step]);

  const single = urls.length === 1;

  return (
    <>
      <div className={`grid gap-2 ${single ? "" : "grid-cols-2"}`}>
        {urls.map((url, i) => {
          // 홀수 장이면 첫 장을 넓게 깔아 격자에 빈칸이 생기지 않게 한다
          const shape = single
            ? "aspect-[4/3]"
            : i === 0 && urls.length % 2 === 1
              ? "col-span-2 aspect-[16/9]"
              : "aspect-square";
          return (
            <button
              key={url}
              type="button"
              onClick={() => setOpenIndex(i)}
              aria-label={`사진 ${i + 1} 크게 보기`}
              className={`group relative overflow-hidden rounded-2xl bg-gray-50 ${shape}`}
            >
              <Image
                src={url}
                alt=""
                fill
                quality={90}
                sizes="(max-width: 768px) 100vw, 720px"
                className={`${single ? "object-contain" : "object-cover"} transition-transform duration-500 group-hover:scale-[1.03]`}
              />
            </button>
          );
        })}
      </div>

      <AnimatePresence>
        {openIndex !== null && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="사진 크게 보기"
            className="fixed inset-0 z-[200] flex items-center justify-center bg-navy-900/90 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
          >
            <motion.div
              key={openIndex}
              className="relative h-[80vh] w-full max-w-5xl"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 26 }}
              onClick={(e) => e.stopPropagation()}
            >
              <Image src={urls[openIndex]} alt="" fill quality={90} sizes="100vw" className="object-contain" />
            </motion.div>

            <button
              type="button"
              onClick={close}
              aria-label="닫기"
              className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
            >
              <X className="h-5 w-5" />
            </button>
            {urls.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    step(-1);
                  }}
                  aria-label="이전 사진"
                  className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    step(1);
                  }}
                  aria-label="다음 사진"
                  className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
                <p className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold tabular-nums text-white">
                  {openIndex + 1} / {urls.length}
                </p>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
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
  // 누를 때만 아이콘이 톡 튀도록 — 처음 들어왔을 때 이미 좋아요 상태여도 튀지 않게 클릭 횟수를 key로 쓴다
  const [likePulse, setLikePulse] = useState(0);

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

  const handleLike = () => {
    setLikePulse((n) => n + 1);
    toggleLike.mutate();
  };

  return (
    <MotionConfig reducedMotion="user">
      <motion.article
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE_OUT }}
        className="overflow-hidden rounded-[28px] bg-white ring-1 ring-gray-100"
      >
        <header className="border-b border-gray-100 bg-gradient-to-b from-ocean-50/80 to-white px-6 pb-6 pt-6 md:px-10 md:pt-8">
          <Link
            href={backHref}
            className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 transition-colors hover:text-navy-900"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            {gallery ? `${gallery.name} 한끗 게시판` : "한끗"}
          </Link>

          <div className="mt-5 flex flex-wrap items-center gap-1.5">
            {post.districtTag && (
              <span className="rounded-full bg-navy-900 px-2.5 py-1 text-[11px] font-bold text-lime-300">
                {POST_DISTRICT_LABELS[post.districtTag]}
              </span>
            )}
            {post.categoryTags.map((tag) => (
              <span key={tag} className="rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-ocean-600 ring-1 ring-inset ring-ocean-100">
                {POST_CATEGORY_LABELS[tag]}
              </span>
            ))}
          </div>

          <h1 className="mt-3 text-[26px] font-bold leading-snug tracking-tight text-navy-900 text-balance break-keep md:text-[32px]">
            {post.title}
          </h1>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <AuthorAvatar name={authorName} imageUrl={post.author.profileImageUrl ?? undefined} size={40} />
            <div className="min-w-0 flex-1 text-xs text-gray-400">
              <span className="text-sm font-semibold text-gray-800">{authorName}</span>
              <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5">
                <span>
                  {formatDateTime(post.createdAt)}
                  {isEdited(post.createdAt, post.updatedAt) && " (수정됨)"}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="h-3.5 w-3.5" />
                  {post.viewCount}
                </span>
                <span className="flex items-center gap-1">
                  <MessageCircle className="h-3.5 w-3.5" />
                  {post.commentCount}
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
                    <button onClick={() => setConfirmingDelete(false)} className="text-gray-400 hover:underline">
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
        </header>

        <div className="px-6 pb-8 pt-6 md:px-10">
          {removePost.isError && (
            <p role="alert" className="mb-4 rounded-xl bg-red-50 px-4 py-2.5 text-xs font-medium text-red-500">
              {removePost.error.message}
            </p>
          )}

          {post.imageUrls.length > 0 && <PostImages urls={post.imageUrls} />}

          <p
            className={`whitespace-pre-wrap text-base leading-8 text-gray-800 break-keep [overflow-wrap:anywhere] ${
              post.imageUrls.length > 0 ? "mt-6" : ""
            }`}
          >
            {post.content}
          </p>

          <div className="mt-10 flex flex-col items-center gap-2">
            <motion.button
              type="button"
              onClick={handleLike}
              disabled={!user || toggleLike.isPending}
              aria-pressed={post.isLiked}
              whileTap={{ scale: 0.92 }}
              className={`flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                post.isLiked
                  ? "bg-navy-900 text-lime-300"
                  : "bg-white text-gray-600 ring-1 ring-inset ring-gray-200 hover:ring-gray-300"
              }`}
            >
              <motion.span
                key={likePulse}
                className="flex"
                initial={likePulse > 0 ? { scale: 0.4, rotate: -20 } : false}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 14 }}
              >
                <ThumbsUp className={`h-4 w-4 ${post.isLiked ? "fill-current" : ""}`} />
              </motion.span>
              좋아요
              <span className="relative inline-flex h-5 items-center overflow-hidden tabular-nums">
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.span
                    key={post.likeCount}
                    initial={{ y: -14, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 14, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {post.likeCount}
                  </motion.span>
                </AnimatePresence>
              </span>
            </motion.button>
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
        </div>
      </motion.article>
    </MotionConfig>
  );
}
