import { useQuery } from "@tanstack/react-query";
import { fetchSpotDetail } from "../apis/spot";
import { spotKeys } from "./useSpotMarkers";

export const useSpotDetail = (contentId: string | null) => {
  return useQuery({
    queryKey: spotKeys.detail(contentId ?? ""),
    queryFn: () => fetchSpotDetail(contentId!),
    enabled: !!contentId,
    staleTime: 1000 * 60 * 10,
    // 실패는 대부분 없는 id라 한 번만 다시 시도한다 (기본 3번이면 모달이 몇 초씩 스켈레톤)
    retry: 1,
  });
};