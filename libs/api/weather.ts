import { clientFetch } from "@/libs/clientFetch";
import type { ApiResponse } from "@/types/course";
import type { PtyCode, WeatherApiItem, WeatherObservation } from "@/types/weather";

// 백엔드가 외부 기상청 API를 못 받아오면 "-" 같은 값을 내려줄 때가 있어서 숫자로 안 바뀌면 null 처리
function safeNumber(value: string): number | null {
  const n = Number(value);
  return Number.isNaN(n) ? null : n;
}

function normalizeWeatherItem(raw: WeatherApiItem): WeatherObservation {
  return {
    district: raw.district,
    tmp: safeNumber(raw.tmp),
    pty: (safeNumber(raw.pty) ?? 0) as PtyCode,
    reh: safeNumber(raw.reh),
    wsd: safeNumber(raw.wsd),
    rn1: safeNumber(raw.rn1),
  };
}

// district 없으면 부산 전체 구별 배열, 있으면 해당 구만 필터링되어 반환 (백엔드 Redis 캐시, 1시간 TTL)
export async function fetchWeather(district?: string): Promise<WeatherObservation[]> {
  const query = district ? `?district=${encodeURIComponent(district)}` : "";
  const res = await clientFetch(`/api/v1/weather${query}`);
  if (!res.ok) throw new Error("Failed to fetch weather");
  const json: ApiResponse<WeatherApiItem[]> = await res.json();
  return (json.data ?? []).map(normalizeWeatherItem);
}
