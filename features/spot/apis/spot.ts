import { clientFetch } from "@/libs/clientFetch";
import type { ApiResponse, SpotDetail, SpotMarker } from "@/types/spot";

// 마커 목록 (지도 표시용) - 클라이언트
export const fetchSpotMarkers = async (): Promise<SpotMarker[]> => {
  const res = await clientFetch("/api/v1/spots/markers");
  const json: ApiResponse<SpotMarker[]> = await res.json();
  return json.data;
};

// 상세 조회 - 클라이언트
export const fetchSpotDetail = async (contentId: string): Promise<SpotDetail> => {
  const res = await clientFetch(`/api/v1/spots/${contentId}`);
  const json: ApiResponse<SpotDetail> = await res.json();
  return json.data;
};