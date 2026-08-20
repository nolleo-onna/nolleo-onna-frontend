"use client";

import { useCallback, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export type VoteType = "like" | "dislike";

/**
 * 게시글 좋아요/싫어요 — 유저 1명당 글 1개에 한 투표만 남게 `${postId}:${userId}`
 * 키로 저장한다. 같은 버튼 다시 누르면 취소, 반대 버튼 누르면 전환된다.
 */
type VoteMap = Record<string, VoteType>;

const STORAGE_KEY = "hankkut:votes";

function readVotes(): VoteMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeVotes(votes: VoteMap) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(votes));
  } catch {
    // 투표는 용량이 작아 실패 가능성이 낮음 — 실패해도 UI는 낙관적으로 유지
  }
}

const votesKey = ["hankkutVotes"] as const;

export function useHankkutVotes(postId: string, userId: number | undefined) {
  const queryClient = useQueryClient();

  const { data: votes = {} } = useQuery<VoteMap>({
    queryKey: votesKey,
    queryFn: readVotes,
    staleTime: Infinity,
  });

  const counts = useMemo(() => {
    let likeCount = 0;
    let dislikeCount = 0;
    const prefix = `${postId}:`;
    for (const [key, value] of Object.entries(votes)) {
      if (!key.startsWith(prefix)) continue;
      if (value === "like") likeCount += 1;
      else dislikeCount += 1;
    }
    return { likeCount, dislikeCount };
  }, [votes, postId]);

  const myVote = userId !== undefined ? votes[`${postId}:${userId}`] : undefined;

  const toggleVote = useCallback(
    (type: VoteType) => {
      if (userId === undefined) return;
      const key = `${postId}:${userId}`;
      const next = { ...readVotes() };
      if (next[key] === type) delete next[key];
      else next[key] = type;
      writeVotes(next);
      queryClient.setQueryData(votesKey, next);
    },
    [postId, userId, queryClient],
  );

  return { ...counts, myVote, toggleVote };
}
