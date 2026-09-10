"use client";

import { useState } from "react";
import Link from "next/link";
import { CornerDownRight, MessageCircle, Trash2 } from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import {
  useCreateComment,
  useDeleteComment,
  usePostComments,
} from "@/features/hankkut/hooks/usePostComments";
import { maskName } from "@/features/hankkut/utils/maskName";
import AuthorAvatar from "@/features/hankkut/components/AuthorAvatar";

import type { PostComment } from "@/types/post";

interface CommentSectionProps {
  postId: number;
  commentCount: number;
}

const CONTENT_MAX = 500;

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(
    2,
    "0",
  )} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

interface CommentRowProps {
  comment: PostComment;
  isMine: boolean;
  isReply?: boolean;
  onRemove: () => void;
  onReply?: () => void;
}

function CommentRow({ comment, isMine, isReply = false, onRemove, onReply }: CommentRowProps) {
  const authorName = maskName(comment.author.nickname);
  return (
    <li className={`flex gap-2.5 py-3 ${isReply ? "pl-9" : ""}`}>
      {isReply ? (
        <CornerDownRight className="mt-1 h-3.5 w-3.5 shrink-0 text-gray-300" />
      ) : (
        <AuthorAvatar name={authorName} imageUrl={comment.author.profileImageUrl ?? undefined} size={28} />
      )}
      <div className="min-w-0 flex-1">
        {comment.deleted ? (
          <p className="text-[13px] text-gray-400">삭제된 댓글이에요</p>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-800">{authorName}</span>
              <span className="text-[10px] text-gray-400">{formatDateTime(comment.createdAt)}</span>
            </div>
            <p className="mt-1 whitespace-pre-wrap text-[13px] leading-relaxed text-gray-700">
              {comment.content}
            </p>
            <div className="mt-1 flex items-center gap-2.5 text-[11px] text-gray-400">
              {onReply && (
                <button type="button" onClick={onReply} className="hover:text-gray-600">
                  답글
                </button>
              )}
              {isMine && (
                <button
                  type="button"
                  onClick={onRemove}
                  className="flex items-center gap-0.5 hover:text-red-500"
                >
                  <Trash2 className="h-3 w-3" />
                  삭제
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </li>
  );
}

/** 댓글 — 최상위 댓글 + 한 단계 답글. 수정 API는 없어 삭제만 지원한다 */
export default function CommentSection({ postId, commentCount }: CommentSectionProps) {
  const { user, isLoggedIn } = useAuth();
  const { data, isPending, isError } = usePostComments(postId);
  const createComment = useCreateComment(postId);
  const removeComment = useDeleteComment(postId);
  const [draft, setDraft] = useState("");
  const [replyTo, setReplyTo] = useState<PostComment | null>(null);

  const comments = data?.content ?? [];
  const isMine = (comment: PostComment) =>
    !!user && user.nickname === comment.author.nickname;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = draft.trim();
    if (!trimmed || !user || createComment.isPending) return;
    createComment.mutate(
      { content: trimmed, parentCommentId: replyTo?.id },
      {
        onSuccess: () => {
          setDraft("");
          setReplyTo(null);
        },
      },
    );
  };

  return (
    <section className="mt-8 border-t border-gray-100 pt-6">
      <p className="flex items-center gap-1.5 text-sm font-bold text-gray-900">
        <MessageCircle className="h-4 w-4 text-ocean-500" />
        댓글 {data?.totalElements ?? commentCount}
      </p>

      {isPending ? (
        <div className="mt-3 space-y-2">
          <div className="animate-shimmer h-10 rounded-xl" />
          <div className="animate-shimmer h-10 rounded-xl" />
        </div>
      ) : isError ? (
        <p className="mt-3 text-xs text-gray-400">댓글을 불러오지 못했어요</p>
      ) : (
        comments.length > 0 && (
          <ul className="mt-1 divide-y divide-gray-50">
            {comments.map((comment) => (
              <li key={comment.id}>
                <ul>
                  <CommentRow
                    comment={comment}
                    isMine={isMine(comment)}
                    onRemove={() => removeComment.mutate(comment.id)}
                    onReply={isLoggedIn ? () => setReplyTo(comment) : undefined}
                  />
                  {comment.replies.map((reply) => (
                    <CommentRow
                      key={reply.id}
                      comment={reply}
                      isMine={isMine(reply)}
                      isReply
                      onRemove={() => removeComment.mutate(reply.id)}
                    />
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        )
      )}

      {(createComment.isError || removeComment.isError) && (
        <p role="alert" className="mt-3 text-xs font-medium text-red-500">
          {createComment.error?.message ?? removeComment.error?.message}
        </p>
      )}

      {isLoggedIn && user ? (
        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-1.5">
          {replyTo && (
            <p className="flex items-center gap-1.5 text-[11px] text-gray-500">
              <CornerDownRight className="h-3 w-3" />
              {maskName(replyTo.author.nickname)}님에게 답글
              <button
                type="button"
                onClick={() => setReplyTo(null)}
                className="text-gray-400 underline underline-offset-2 hover:text-gray-600"
              >
                취소
              </button>
            </p>
          )}
          <div className="flex items-start gap-2.5">
            <AuthorAvatar name={maskName(user.nickname)} imageUrl={user.profileImageUrl} size={28} />
            <div className="flex flex-1 items-end gap-2">
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                maxLength={CONTENT_MAX}
                rows={1}
                placeholder={replyTo ? "답글을 남겨보세요" : "댓글을 남겨보세요"}
                className="flex-1 resize-none rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-[13px] text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:border-ocean-400 focus:bg-white"
              />
              <button
                type="submit"
                disabled={!draft.trim() || createComment.isPending}
                className="shrink-0 rounded-full bg-navy-900 px-4 py-2 text-xs font-semibold text-lime-300 transition-transform hover:-translate-y-0.5 active:scale-95 disabled:opacity-30 disabled:hover:translate-y-0"
              >
                {createComment.isPending ? "등록 중" : "등록"}
              </button>
            </div>
          </div>
        </form>
      ) : (
        <p className="mt-4 text-xs text-gray-400">
          <Link href="/login" className="font-semibold text-ocean-600 hover:underline">
            로그인
          </Link>
          하면 댓글을 남길 수 있어요
        </p>
      )}
    </section>
  );
}
