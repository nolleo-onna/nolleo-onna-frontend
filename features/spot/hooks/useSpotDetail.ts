import { useQuery } from "@tanstack/react-query";
import { fetchSpotDetail } from "../apis/spot";
import { spotKeys } from "./useSpotMarkers";

export const useSpotDetail = (contentId: string | null) => {
  return useQuery({
    queryKey: spotKeys.detail(contentId ?? ""),
    queryFn: () => fetchSpotDetail(contentId!),
    enabled: !!contentId, // contentId 있을 때만 호출
    staleTime: 1000 * 60 * 10,
  });
};