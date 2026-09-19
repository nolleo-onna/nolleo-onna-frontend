"use client";

import {
  keepPreviousData,
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  createPost,
  deletePost,
  fetchPost,
  fetchPosts,
  togglePostLike,
  updatePost,
} from "@/libs/api/posts";

import type { Page, PostDetail, PostDistrictTag, PostSummary, PostWriteRequest } from "@/types/post";

export const postKeys = {
  all: ["posts"] as const,
  lists: () => [...postKeys.all, "list"] as const,
  list: (district: PostDistrictTag | undefined, page: number, size: number) =>
    [...postKeys.lists(), district ?? "all", page, size] as const,
  detail: (postId: number) => [...postKeys.all, "detail", postId] as const,
};

export const BOARD_PAGE_SIZE = 20;

/** 인기 정렬·핫이슈 후보로 보는 최근 글 수 — 서버가 조회수순을 지원하기 전까지 이 안에서 정렬한다 */
export const RECENT_POSTS_WINDOW = 50;

/** 갤러리(행정구) 자유게시판 목록 — 서버 페이징, 페이지 넘길 때 이전 목록을 유지해 깜빡임을 막는다 */
export function useRegionPosts(
  district: PostDistrictTag | undefined,
  page = 0,
  size = BOARD_PAGE_SIZE,
) {
  return useQuery({
    queryKey: postKeys.list(district, page, size),
    queryFn: () => fetchPosts({ district, page, size }),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 30,
  });
}

/** 동네 최근 글 50개 — 화제글 [인기] 탭과 핫이슈가 같은 캐시를 쓴다 */
export function useRecentRegionPosts(district: PostDistrictTag) {
  return useRegionPosts(district, 0, RECENT_POSTS_WINDOW);
}

/** 허브 카드용 — 갤러리별 글 수와 최신 글 제목만 (size=1로 가볍게) */
export function useDistrictPostStats(districts: PostDistrictTag[]) {
  return useQueries({
    queries: districts.map((district) => ({
      queryKey: postKeys.list(district, 0, 1),
      queryFn: () => fetchPosts({ district, page: 0, size: 1 }),
      staleTime: 1000 * 60,
    })),
    combine: (results) => {
      const byDistrict = new Map<PostDistrictTag, { count: number; latest: PostSummary | undefined }>();
      results.forEach((result, i) => {
        byDistrict.set(districts[i], {
          count: result.data?.totalElements ?? 0,
          latest: result.data?.content[0],
        });
      });
      return byDistrict;
    },
  });
}

// 단건 조회는 서버가 조회수를 올리므로 캐시를 오래 유지해 재조회를 줄인다.
// 없는 글은 404라 재시도하지 않는다.
export function usePost(postId: number | null) {
  return useQuery({
    queryKey: postKeys.detail(postId ?? 0),
    queryFn: () => fetchPost(postId as number),
    enabled: postId !== null && Number.isInteger(postId) && postId > 0,
    staleTime: 1000 * 60,
    retry: false,
  });
}

/**
 * 핫이슈 카드에 쓸 글 사진.
 * 목록 응답엔 사진 URL이 없고 hasImage(있다/없다)만 와서, 사진 있는 글만 상세를 불러와 첫 장을 쓴다.
 * 상세 캐시(postKeys.detail)를 그대로 쓰므로 글을 눌러 들어가면 다시 부르지 않는다.
 */
export function usePostThumbnails(posts: PostSummary[]): Map<number, string> {
  const withImage = posts.filter((post) => post.hasImage);

  return useQueries({
    queries: withImage.map((post) => ({
      queryKey: postKeys.detail(post.id),
      queryFn: () => fetchPost(post.id),
      staleTime: 1000 * 60,
      retry: false,
    })),
    combine: (results) => {
      const byPostId = new Map<number, string>();
      results.forEach((result, i) => {
        const first = result.data?.imageUrls?.[0];
        if (first) byPostId.set(withImage[i].id, first);
      });
      return byPostId;
    },
  });
}

export function useCreatePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: PostWriteRequest) => createPost(body),
    onSuccess: (created) => {
      queryClient.setQueryData(postKeys.detail(created.id), created);
      queryClient.invalidateQueries({ queryKey: postKeys.lists() });
    },
  });
}

export function useUpdatePost(postId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: PostWriteRequest) => updatePost(postId, body),
    onSuccess: (updated) => {
      queryClient.setQueryData(postKeys.detail(postId), updated);
      queryClient.invalidateQueries({ queryKey: postKeys.lists() });
    },
  });
}

export function useDeletePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (postId: number) => deletePost(postId),
    onSuccess: (_, postId) => {
      queryClient.removeQueries({ queryKey: postKeys.detail(postId) });
      queryClient.invalidateQueries({ queryKey: postKeys.lists() });
    },
  });
}

// 좋아요 토글 — 상세 캐시에 낙관적으로 반영하고 실패하면 되돌린다
export function useTogglePostLike(postId: number) {
  const queryClient = useQueryClient();
  const key = postKeys.detail(postId);

  return useMutation({
    mutationFn: () => togglePostLike(postId),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: key });
      const prev = queryClient.getQueryData<PostDetail>(key);
      if (prev) {
        queryClient.setQueryData<PostDetail>(key, {
          ...prev,
          isLiked: !prev.isLiked,
          likeCount: prev.likeCount + (prev.isLiked ? -1 : 1),
        });
      }
      return { prev };
    },
    onSuccess: (result) => {
      queryClient.setQueryData<PostDetail>(key, (cur) =>
        cur ? { ...cur, isLiked: result.isLiked, likeCount: result.likeCount } : cur,
      );
    },
    onError: (_error, _vars, context) => {
      if (context?.prev) queryClient.setQueryData(key, context.prev);
    },
    onSettled: () => {
      // 목록의 좋아요 수도 함께 바뀐다
      queryClient.invalidateQueries({ queryKey: postKeys.lists() });
    },
  });
}

export type { Page, PostSummary };
