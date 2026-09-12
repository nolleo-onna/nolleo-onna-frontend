import { useInfiniteQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { fetchMapPlaces } from "../apis/map";
import type { MapPlacesParams } from "@/types/map";

export const mapPlaceKeys = {
  all: ["mapPlaces"] as const,
  list: (params: MapPlacesParams) => [...mapPlaceKeys.all, params] as const,
};

// 백엔드가 size를 100으로 캡한다. 그 이상 요청해도 100씩 온다.
export const MAP_PLACES_PAGE_SIZE = 100;

/**
 * 검색창에서 해석한 조건 중 서버가 받는 것. 예전엔 검색을 브라우저에서 "지금까지 받은
 * 페이지" 안에서만 걸렀는데, 서버가 관광(VE)을 먼저 주고 맛집·카페(FD)는 뒤쪽 페이지에
 * 몰려 있어서 첫 100개엔 FD가 없었다 → "카페" 검색이 0건이 되고, 0건이면 다음 페이지를
 * 불러오는 sentinel도 사라져 영영 막혔다. 지역·카테고리·이름 검색은 서버에서 거른다.
 */
export interface MapPlacesSearchFilter {
  district?: string;
  category?: string;
  keyword?: string;
}

export const useMapPlaces = (search: MapPlacesSearchFilter = {}) => {
  const searchParams = useSearchParams();

  const regions = searchParams.getAll("region");
  const categories = searchParams.getAll("category");
  const budgetParam = searchParams.get("budget");
  const maxBudget = budgetParam ? Number(budgetParam) : undefined;

  // 왼쪽 필터(URL)가 우선, 없으면 검색창에서 해석한 값. 서버는 구·카테고리를 하나씩만 받는다.
  const district = regions.length === 1 ? regions[0] : regions.length === 0 ? search.district : undefined;
  const category =
    categories.length === 1 ? categories[0] : categories.length === 0 ? search.category : undefined;

  const params: MapPlacesParams = {
    ...(district && { district }),
    ...(category && { category }),
    ...(search.keyword && { keyword: search.keyword }),
    ...(maxBudget !== undefined && maxBudget > 0 && { maxBudget }),
    // 기본 정렬(id순)이면 첫 페이지가 이미지 없는 항목(주로 맛집)으로만 채워질 수 있어
    // imageUrl 오름차순으로 이미지 있는 항목을 먼저 받는다.
    sort: "imageUrl,asc",
    size: MAP_PLACES_PAGE_SIZE,
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

  return query;
};
