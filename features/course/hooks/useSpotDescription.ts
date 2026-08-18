"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchSpotDetail, fetchFoodDetail } from "@/features/spot/apis/spot";

const FOOD_CATEGORIES = ["음식점", "카페", "맛집"];

export function isFoodCategory(category?: string) {
  if (!category) return false;
  return FOOD_CATEGORIES.some((c) => category.includes(c));
}

export interface SpotDescription {
  overview: string;
  address: string;
  tel: string;
}

/**
 * 코스 스팟의 설명글을 가져온다.
 * 카테고리에 따라 spot / food 상세 API를 선택하고, 실패해도 UI를 막지 않는다.
 */
export function useSpotDescription(contentId: string | null, category?: string) {
  const isFood = isFoodCategory(category);

  return useQuery<SpotDescription | null>({
    queryKey: ["spotDescription", contentId, isFood],
    queryFn: async () => {
      if (!contentId) return null;
      try {
        if (isFood) {
          const food = await fetchFoodDetail(contentId);
          return {
            overview: food.description ?? "",
            address: food.address ?? "",
            tel: food.tel ?? "",
          };
        }
        const spot = await fetchSpotDetail(contentId);
        return {
          overview: spot.overview ?? "",
          address: [spot.addr1, spot.addr2].filter(Boolean).join(" "),
          tel: spot.tel ?? "",
        };
      } catch {
        return null;
      }
    },
    enabled: !!contentId,
    staleTime: 1000 * 60 * 10,
    retry: false,
  });
}