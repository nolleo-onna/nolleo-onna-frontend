import { clientFetch } from "@/libs/clientFetch";

import type { ApiResponse } from "@/types/auth";

export type FavoritePeriod = "TODAY" | "WEEK" | "MONTH";

// GET /api/v1/users/me/favorite-stats — 오늘 → 이번 주 → 이번 달 순으로
// 찜이 있는 가장 짧은 기간을 골라 준다. message는 서버가 완성한 문장.
export interface FavoriteStats {
  period: FavoritePeriod;
  count: number;
  message: string;
}

export async function fetchFavoriteStats(): Promise<FavoriteStats> {
  const res = await clientFetch("/api/v1/users/me/favorite-stats");
  if (!res.ok) throw new Error("찜 통계를 불러오지 못했어요");
  const json: ApiResponse<FavoriteStats> = await res.json();
  return json.data;
}
