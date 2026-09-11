import { clientFetch } from "@/libs/clientFetch";
import type { ApiResponse, SpotDetail, FoodDetail, MapMarker } from "@/types/spot";

export const fetchSpotMarkers = async (): Promise<MapMarker[]> => {
  const res = await clientFetch("/api/v1/map/markers");
  const json: ApiResponse<MapMarker[]> = await res.json();
  return json.data ?? [];
};

export const fetchSpotDetail = async (contentId: string): Promise<SpotDetail> => {
  const res = await clientFetch(`/api/v1/spots/${contentId}`);
  if (!res.ok) throw new Error("Failed to fetch spot detail");
  const json: ApiResponse<SpotDetail> = await res.json();
  if (!json.data) throw new Error("No data");
  return json.data;
};

export const fetchFoodDetail = async (id: string): Promise<FoodDetail> => {
  const res = await clientFetch(`/api/v1/food/${id}`);
  if (!res.ok) throw new Error("Failed to fetch food detail");
  const json: ApiResponse<FoodDetail> = await res.json();
  if (!json.data) throw new Error("No data");
  return json.data;
};

export const postReview = async (mapPlaceId: number, rating: number): Promise<void> => {
  const res = await clientFetch("/api/v1/reviews", {
    method: "POST",
    body: JSON.stringify({ mapPlaceId, rating }),
  });
  if (!res.ok) throw new Error("Failed to post review");
};

export const patchReview = async (mapPlaceId: number, rating: number): Promise<void> => {
  const res = await clientFetch(`/api/v1/reviews/${mapPlaceId}`, {
    method: "PATCH",
    body: JSON.stringify({ rating }),
  });
  if (!res.ok) throw new Error("Failed to patch review");
};
export interface PlaceRating {
  avgRating: number;
  reviewCount: number;
}

// 장소 평균 평점·리뷰 수 (공개 API, 서버가 Redis 캐시 우선)
export const fetchPlaceRating = async (mapPlaceId: number): Promise<PlaceRating> => {
  const res = await clientFetch(`/api/v1/map/places/${mapPlaceId}/rating`);
  if (!res.ok) throw new Error("Failed to fetch place rating");
  const json: ApiResponse<PlaceRating> = await res.json();
  return json.data ?? { avgRating: 0, reviewCount: 0 };
};
