"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, MessageCircle, Pencil, Trash2, X } from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import { useCustomNickname } from "@/features/mypage/hooks/useCustomNickname";
import {
  useHankkutComments,
  type HankkutComment,
} from "@/features/hankkut/hooks/useHankkutComments";
import { maskName } from "@/features/hankkut/utils/maskName";
import AuthorAvatar from "@/features/hankkut/components/AuthorAvatar";

interface CommentSectionProps {
  postId: string;
}

const CONTENT_MAX = 500;

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(
    2,
    "0",
  )} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function CommentRow({
  comment,
  isAuthor,
  onUpdate,
  onRemove,
}: {
  comment: HankkutComment;
  isAuthor: boolean;
  onUpdate: (content: string) => void;
  onRemove: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(comment.content);

  const handleSave = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    onUpdate(trimmed);
    setEditing(false);
  };

  return (
    <li className="flex gap-2.5 py-3">
      <AuthorAvatar name={comment.author} size={28} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-gray-800">{comment.author}</span>
          <span className="text-[10px] text-gray-400">
            {formatDateTime(comment.createdAt)}
            {comment.updatedAt && " (수정됨)"}
          </span>
        </div>

        {editing ? (
          <div className="mt-1.5 flex flex-col gap-1.5">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              maxLength={CONTENT_MAX}
              rows={2}
              autoFocus
              className="w-full resize-none rounded-lg border border-ocean-300 bg-white px-2.5 py-1.5 text-[13px] text-gray-900 outline-none"
            />
            <div className="flex items-center gap-2 text-[11px] font-semibold">
              <button
                type="button"
                onClick={handleSave}
                className="flex items-center gap-0.5 text-ocean-600 hover:underline"
              >
                <Check className="h-3 w-3" />
                저장
              </button>
              <button
                type="button"
                onClick={() => {
                  setDraft(comment.content);
                  setEditing(false);
                }}
                className="flex items-center gap-0.5 text-gray-400 hover:underline"
              >
                <X className="h-3 w-3" />
                취소
              </button>
            </div>
          </div>
        ) : (
          <p className="mt-1 whitespace-pre-wrap text-[13px] leading-relaxed text-gray-700">
            {comment.content}
          </p>
        )}

        {isAuthor && !editing && (
          <div className="mt-1 flex items-center gap-2.5 text-[11px] text-gray-400">
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="flex items-center gap-0.5 hover:text-gray-600"
            >
              <Pencil className="h-3 w-3" />
              수정
            </button>
            <button
              type="button"
              onClick={onRemove}
              className="flex items-center gap-0.5 hover:text-red-500"
            >
              <Trash2 className="h-3 w-3" />
              삭제
            </button>
          </div>
        )}
      </div>
    </li>
  );
}

export default function CommentSection({ postId }: CommentSectionProps) {
  const { user, isLoggedIn } = useAuth();
  const { customNickname } = useCustomNickname(user?.userId);
  const { comments, createComment, updateComment, removeComment } =
    useHankkutComments(postId);
  const [draft, setDraft] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = draft.trim();
    if (!trimmed || !user) return;
    createComment({
      content: trimmed,
      author: customNickname ?? maskName(user.nickname),
      authorId: user.userId,
    });
    setDraft("");
  };

  return (
    <section className="mt-8 border-t border-gray-100 pt-6">
      <p className="flex items-center gap-1.5 text-sm font-bold text-gray-900">
        <MessageCircle className="h-4 w-4 text-ocean-500" />
        댓글 {comments.length}
      </p>

      {comments.length > 0 && (
        <ul className="mt-1 divide-y divide-gray-50">
          {comments.map((comment) => (
            <CommentRow
              key={comment.id}
              comment={comment}
              isAuthor={user?.userId === comment.authorId}
              onUpdate={(content) => updateComment(comment.id, content)}
              onRemove={() => removeComment(comment.id)}
            />
          ))}
        </ul>
      )}

      {isLoggedIn && user ? (
        <form onSubmit={handleSubmit} className="mt-4 flex items-start gap-2.5">
          <AuthorAvatar name={customNickname ?? maskName(user.nickname)} size={28} />
          <div className="flex flex-1 items-end gap-2">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              maxLength={CONTENT_MAX}
              rows={1}
              placeholder="댓글을 남겨보세요"
              className="flex-1 resize-none rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-[13px] text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:border-ocean-400 focus:bg-white"
            />
            <button
              type="submit"
              disabled={!draft.trim()}
              className="shrink-0 rounded-full bg-navy-900 px-4 py-2 text-xs font-semibold text-lime-300 transition-transform hover:-translate-y-0.5 active:scale-95 disabled:opacity-30 disabled:hover:translate-y-0"
            >
              등록
            </button>
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
