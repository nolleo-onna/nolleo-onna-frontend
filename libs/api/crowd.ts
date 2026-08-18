import { clientFetch } from "@/libs/clientFetch";
import type { ApiResponse } from "@/types/course";
import type { CongestionDistrict, CrowdSpot } from "@/types/crowd";

function flattenDistricts(districts: CongestionDistrict[]): CrowdSpot[] {
  return districts.flatMap((d) =>
    d.attractions.map((a) => ({
      name: a.name,
      district: d.district,
      rate: a.rate,
      baseYmd: d.baseYmd,
    })),
  );
}

// district 없으면 부산 전체, 있으면 해당 구만 반환 (백엔드 Redis 캐시, 24시간 TTL)
export async function fetchCrowd(district?: string): Promise<CrowdSpot[]> {
  const query = district ? `?district=${encodeURIComponent(district)}` : "";
  const res = await clientFetch(`/api/v1/congestion${query}`);
  if (!res.ok) throw new Error("Failed to fetch congestion");
  const json: ApiResponse<CongestionDistrict[]> = await res.json();
  const spots = flattenDistricts(json.data ?? []);
  return spots.sort((a, b) => b.rate - a.rate);
}
