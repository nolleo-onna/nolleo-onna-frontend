"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";

// 백엔드에 프로필 수정 API가 아직 없어서(Swagger 기준 auth는 me/logout/refresh뿐)
// 소셜 닉네임을 덮어쓰는 커스텀 닉네임을 localStorage에 계정(userId)별로 저장한다.
// 서버 API가 생기면 이 훅의 저장/조회 부분만 교체하면 화면 코드는 그대로 쓸 수 있다.
const storageKey = (userId: number) => `profile:nickname:${userId}`;

export function useCustomNickname(userId: number | undefined) {
  const queryClient = useQueryClient();

  // localStorage 값을 React Query 캐시로 감싸서, 저장 시 구독 중인
  // 모든 컴포넌트(헤더 칩, 마이페이지 히어로)가 함께 갱신되게 한다.
  const { data } = useQuery<string | null>({
    queryKey: ["customNickname", userId],
    enabled: userId !== undefined,
    staleTime: Infinity,
    queryFn: () => localStorage.getItem(storageKey(userId!)),
  });

  const saveNickname = (nickname: string) => {
    if (userId === undefined) return;
    const trimmed = nickname.trim();
    if (trimmed) {
      localStorage.setItem(storageKey(userId), trimmed);
    } else {
      // 비워서 저장하면 소셜 계정 닉네임으로 되돌아간다
      localStorage.removeItem(storageKey(userId));
    }
    queryClient.setQueryData(["customNickname", userId], trimmed || null);
  };

  return { customNickname: data ?? null, saveNickname };
}
