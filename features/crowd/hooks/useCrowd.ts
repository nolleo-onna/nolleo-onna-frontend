import { useQuery } from "@tanstack/react-query";
import { fetchCrowd } from "@/libs/api/crowd";

export function useCrowd(district?: string) {
  return useQuery({
    queryKey: ["crowd", district ?? "all"],
    queryFn: () => fetchCrowd(district),
    staleTime: 1000 * 60 * 60, // 백엔드 캐시 TTL(24시간)이 길어서 여유있게 설정
  });
}
