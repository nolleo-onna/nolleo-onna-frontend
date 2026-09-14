"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { fetchSharedCourse, toggleSharedCourseLike } from "@/libs/api/course";
import { popularCoursesKey } from "@/features/home/hooks/usePopularCourses";

import type { SharedCourse } from "@/types/course";

export const sharedCourseKeys = {
  detail: (shareToken: string) => ["sharedCourse", shareToken] as const,
};

// 공유 링크로 열리는 공개 코스 — 로그인 불필요. 없거나 비공개면 404라 재시도하지 않는다.
export function useSharedCourse(shareToken: string) {
  return useQuery({
    queryKey: sharedCourseKeys.detail(shareToken),
    queryFn: () => fetchSharedCourse(shareToken),
    enabled: shareToken.length > 0,
    staleTime: 1000 * 60,
    retry: false,
  });
}

// 좋아요 토글 — 누르는 즉시 하트·숫자를 바꾸고 실패하면 되돌린다. 홈 인기 코스의 숫자도 다시 받아온다.
export function useToggleSharedCourseLike(shareToken: string) {
  const queryClient = useQueryClient();
  const key = sharedCourseKeys.detail(shareToken);

  return useMutation({
    mutationFn: () => toggleSharedCourseLike(shareToken),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: key });
      const prev = queryClient.getQueryData<SharedCourse>(key);
      if (prev) {
        queryClient.setQueryData<SharedCourse>(key, {
          ...prev,
          likedByMe: !prev.likedByMe,
          likeCount: prev.likeCount + (prev.likedByMe ? -1 : 1),
        });
      }
      return { prev };
    },
    onSuccess: (result) => {
      queryClient.setQueryData<SharedCourse>(key, (cur) =>
        cur ? { ...cur, likedByMe: result.liked, likeCount: result.likeCount } : cur,
      );
    },
    onError: (_error, _vars, context) => {
      if (context?.prev) queryClient.setQueryData(key, context.prev);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: popularCoursesKey });
    },
  });
}
