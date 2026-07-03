import { useInfiniteQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { fetchMapPlaces } from "../apis/map";
import type { MapPlacesParams } from "@/types/map";

export const mapPlaceKeys = {
  all: ["mapPlaces"] as const,
  list: (params: MapPlacesParams) => [...mapPlaceKeys.all, params] as const,
};

export const useMapPlaces = () => {
  const searchParams = useSearchParams();

  const regions = searchParams.getAll("region");
  const categories = searchParams.getAll("category");
  const budgetParam = searchParams.get("budget");
  const maxBudget = budgetParam ? Number(budgetParam) : undefined;
  const freeOnly = searchParams.get("free_only") === "true";

  const district = regions.length === 1 ? regions[0] : undefined;
  const category = categories.length === 1 ? categories[0] : undefined;

  const params: MapPlacesParams = {
    ...(district && { district }),
    ...(category && { category }),
    ...(maxBudget !== undefined && maxBudget > 0 && { maxBudget }),
    size: 20,
  };

  const query = useInfiniteQuery({
    queryKey: mapPlaceKeys.list(params),
    queryFn: ({ pageParam = 0 }) =>
      fetchMapPlaces({ ...params, page: pageParam as number }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.last) return undefined;
      return allPages.length;
    },
    staleTime: 1000 * 60 * 5,
  });

  return { ...query, freeOnly };
};