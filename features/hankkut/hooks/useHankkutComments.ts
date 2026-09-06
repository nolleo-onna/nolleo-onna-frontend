"use client";

import { useCallback, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

/**
 * 게시글 댓글 저장소 — useHankkutPosts와 같은 localStorage MVP 패턴.
 * 글마다 배열을 따로 두지 않고 전체를 한 키에 저장한 뒤 postId로 걸러
 * 보여준다(게시글 하나 지울 때 댓글도 함께 정리하기 쉽게).
 */
export interface HankkutComment {
  id: string;
  postId: string;
  content: string;
  author: string;
  authorId: number;
  createdAt: string;
  updatedAt?: string;
}

const STORAGE_KEY = "hankkut:comments";

function readComments(): HankkutComment[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeComments(comments: HankkutComment[]): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(comments));
    return true;
  } catch {
    return false;
  }
}

const commentsKey = ["hankkutComments"] as const;

export function useHankkutComments(postId: string) {
  const queryClient = useQueryClient();

  const { data: allComments = [] } = useQuery<HankkutComment[]>({
    queryKey: commentsKey,
    queryFn: readComments,
    staleTime: Infinity,
  });

  const refresh = useCallback(
    (next: HankkutComment[]) => {
      queryClient.setQueryData(commentsKey, next);
    },
    [queryClient],
  );

  const comments = useMemo(
    () =>
      allComments
        .filter((c) => c.postId === postId)
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
    [allComments, postId],
  );

  const createComment = useCallback(
    (input: Omit<HankkutComment, "id" | "postId" | "createdAt">): HankkutComment | null => {
      const comment: HankkutComment = {
        ...input,
        id: crypto.randomUUID(),
        postId,
        createdAt: new Date().toISOString(),
      };
      const next = [...readComments(), comment];
      if (!writeComments(next)) return null;
      refresh(next);
      return comment;
    },
    [postId, refresh],
  );

  const updateComment = useCallback(
    (id: string, content: string) => {
      const next = readComments().map((c) =>
        c.id === id ? { ...c, content, updatedAt: new Date().toISOString() } : c,
      );
      writeComments(next);
      refresh(next);
    },
    [refresh],
  );

  const removeComment = useCallback(
    (id: string) => {
      const next = readComments().filter((c) => c.id !== id);
      writeComments(next);
      refresh(next);
    },
    [refresh],
  );

  return { comments, createComment, updateComment, removeComment };
}

/** 게시글 삭제 시 딸린 댓글도 함께 지운다 */
export function removeCommentsForPost(postId: string) {
  writeComments(readComments().filter((c) => c.postId !== postId));
}
