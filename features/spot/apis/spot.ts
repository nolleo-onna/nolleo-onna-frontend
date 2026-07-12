import { clientFetch } from "@/libs/clientFetch";
import type { ApiResponse, SpotDetail, SpotMarker, FoodDetail } from "@/types/spot";

export const fetchSpotMarkers = async (): Promise<SpotMarker[]> => {
  const res = await clientFetch("/api/v1/spots/markers");
  const json: ApiResponse<SpotMarker[]> = await res.json();
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