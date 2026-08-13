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

  // 검색어 있으면 전체 로드


  const params: MapPlacesParams = {
    ...(district && { district }),
    ...(category && { category }),
    ...(maxBudget !== undefined && maxBudget > 0 && { maxBudget }),
    // 백엔드가 size를 100개로 캡해서 내려주는데, 기본 정렬(id순)이면 첫 페이지가
    // 이미지 없는 항목(주로 맛집)으로만 채워질 수 있다. imageUrl 오름차순으로
    // 정렬해서 이미지 있는 항목이 먼저 오게 한다.
    sort: "imageUrl,asc",
    size: 9999,
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