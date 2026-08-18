import { clientFetch } from "@/libs/clientFetch";
import type { ApiResponse } from "@/types/course";
import type { Congestion } from "@/types/congestion";

/**
 * [테스트용] 혼잡도 캐시 즉시 갱신
 * POST /api/v1/congestion/refresh
 */
export async function refreshCongestion(): Promise<string> {
  const res = await clientFetch("/api/v1/congestion/refresh", { method: "POST" });
  if (!res.ok) throw new Error("혼잡도 갱신 실패");
  const json: ApiResponse<string> = await res.json();
  return json.data;
}

/**
 * 혼잡도 조회
 * GET /api/v1/congestion?district=...
 * district 없으면 부산 전체 구 배열 반환.
 */
export async function fetchCongestion(district?: string): Promise<Congestion[]> {
  const query = district ? `?district=${encodeURIComponent(district)}` : "";
  const res = await clientFetch(`/api/v1/congestion${query}`);
  if (!res.ok) throw new Error("혼잡도 조회 실패");
  const json: ApiResponse<Congestion | Congestion[] | null> = await res.json();
  if (!json.data) return [];
  return Array.isArray(json.data) ? json.data : [json.data];
}
