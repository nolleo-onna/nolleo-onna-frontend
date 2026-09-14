"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { createComment, deleteComment, fetchComments, updateComment } from "@/libs/api/posts";
import { postKeys } from "@/features/hankkut/hooks/usePosts";

import type { CommentCreateRequest } from "@/types/post";

export const commentKeys = {
  list: (postId: number) => [...postKeys.all, "comments", postId] as const,
};

// 한 글의 댓글은 많지 않아 첫 페이지를 넉넉히(50) 받고 따로 페이징하지 않는다
const COMMENT_PAGE_SIZE = 50;

export function usePostComments(postId: number) {
  return useQuery({
    queryKey: commentKeys.list(postId),
    queryFn: () => fetchComments(postId, 0, COMMENT_PAGE_SIZE),
    enabled: postId > 0,
    staleTime: 1000 * 30,
  });
}

// 댓글 수는 게시글 상세(commentCount)에도 있어 둘 다 다시 받는다
function useInvalidateComments(postId: number) {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: commentKeys.list(postId) });
    queryClient.invalidateQueries({ queryKey: postKeys.detail(postId) });
    queryClient.invalidateQueries({ queryKey: postKeys.lists() });
  };
}

export function useCreateComment(postId: number) {
  const invalidate = useInvalidateComments(postId);
  return useMutation({
    mutationFn: (input: Omit<CommentCreateRequest, "postId">) =>
      createComment({ postId, ...input }),
    onSuccess: invalidate,
  });
}

export function useUpdateComment(postId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ commentId, content }: { commentId: number; content: string }) =>
      updateComment(commentId, content),
    // 댓글 수는 그대로라 목록만 다시 받는다
    onSuccess: () => queryClient.invalidateQueries({ queryKey: commentKeys.list(postId) }),
  });
}

export function useDeleteComment(postId: number) {
  const invalidate = useInvalidateComments(postId);
  return useMutation({
    mutationFn: (commentId: number) => deleteComment(commentId),
    onSuccess: invalidate,
  });
}
