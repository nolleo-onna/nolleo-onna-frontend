import { useQuery } from "@tanstack/react-query";
import { fetchWeather } from "@/libs/api/weather";

export function useWeather(district?: string) {
  return useQuery({
    queryKey: ["weather", district ?? "all"],
    queryFn: () => fetchWeather(district),
    staleTime: 1000 * 60 * 30, // 백엔드 Redis 캐시 TTL(1시간)보다 짧게
  });
}
