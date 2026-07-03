import { useQuery } from "@tanstack/react-query";
import { fetchSpotMarkers } from "../apis/spot";

export const spotKeys = {
  all: ["spots"] as const,
  markers: () => [...spotKeys.all, "markers"] as const,
  detail: (contentId: string) => [...spotKeys.all, "detail", contentId] as const,
};

export const useSpotMarkers = () => {
  return useQuery({
    queryKey: spotKeys.markers(),
    queryFn: fetchSpotMarkers,
    staleTime: 1000 * 60 * 5,
  });
};