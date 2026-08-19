import { clientFetch } from "@/libs/clientFetch";

import type { ApiResponse } from "@/types/spot";
import type {
  FavoriteItem,
  FavoritePageResponse,
  FavoriteStatusResponse,
  FavoriteToggleResponse,
} from "@/types/favorite";

// 찜 목록은 페이지네이션으로 내려오지만 개인당 개수가 많지 않아 한 번에 크게 받는다
const FAVORITES_PAGE_SIZE = 100;

export const fetchFavorites = async (): Promise<FavoriteItem[]> => {
  const res = await clientFetch(
    `/api/v1/favorites?size=${FAVORITES_PAGE_SIZE}&sort=favoritedAt,desc`
  );
  if (!res.ok) throw new Error("Failed to fetch favorites");
  const json: ApiResponse<FavoritePageResponse> = await res.json();
  return json.data?.content ?? [];
};

export const toggleFavorite = async (
  mapPlaceId: number
): Promise<FavoriteToggleResponse> => {
  const res = await clientFetch(`/api/v1/favorites/${mapPlaceId}/toggle`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("Failed to toggle favorite");
  const json: ApiResponse<FavoriteToggleResponse> = await res.json();
  if (!json.data) throw new Error("No data");
  return json.data;
};

export const fetchFavoriteStatus = async (
  mapPlaceId: number
): Promise<boolean> => {
  const res = await clientFetch(`/api/v1/favorites/${mapPlaceId}/status`);
  if (!res.ok) throw new Error("Failed to fetch favorite status");
  const json: ApiResponse<FavoriteStatusResponse> = await res.json();
  return json.data?.favorited ?? false;
};
