"use client";

import { useMemo } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { fetchMapPlaces } from "@/features/spot/apis/map";
import { useEvents } from "@/features/event/hooks/useEvents";
import { getEventBadge, sortActiveEvents, toDateKey } from "@/features/event/utils/eventSchedule";
import { CATEGORY_META } from "@/features/spot/constants/categoryMap";
import type { Suggestion } from "@/features/home/components/SearchBar/SuggestField";
import type { MapPlacePage } from "@/types/map";

// 스팟 사이드바 검색도 같이 쓰게 되어 공용 훅으로 옮겼다
export { useDebouncedValue } from "@/hooks/useDebouncedValue";

const SUGGEST_LIMIT = 8;

export const courseSuggestKeys = {
  spots: (keyword: string) => ["mapPlaces", "suggest", keyword] as const,
};

// 후보가 없을 때 매번 새 배열을 만들면 이 값을 보고 되돌리는 쪽이 계속 다시 그린다
const EMPTY: Suggestion[] = [];

// useQuery 밖에 둬야 참조가 고정돼 select 결과가 캐시된다
const toSpotSuggestions = (page: MapPlacePage) =>
  page.content.map(
    (place): Suggestion => ({
      id: place.originalId,
      title: place.name,
      // 맛집은 district가 비어 오는 경우가 많다
      meta: place.district ?? undefined,
      imageUrl: place.imageUrl,
      badge: CATEGORY_META[place.category]?.label,
    }),
  );

/** 꼭 포함할 장소 후보 — 스팟과 같은 장소 목록을 서버 keyword 부분 일치로 찾는다 ("이재" → 이재모피자 본점) */
export function useSpotSuggestions(keyword: string) {
  const trimmed = keyword.trim();
  const { data, isFetching } = useQuery({
    queryKey: courseSuggestKeys.spots(trimmed),
    queryFn: () => fetchMapPlaces({ keyword: trimmed, size: SUGGEST_LIMIT }),
    enabled: trimmed.length > 0,
    staleTime: 1000 * 60 * 5,
    select: toSpotSuggestions,
    // 한 글자 더 칠 때마다 목록이 비었다 다시 차며 깜빡이지 않게 직전 후보를 둔다
    placeholderData: keepPreviousData,
  });

  return { suggestions: data ?? EMPTY, isLoading: isFetching };
}

/** "11.1~11.1" 형태. 종료일이 없거나 시작일과 같으면 한쪽만 */
function formatPeriod(start: string, end: string | null): string | undefined {
  const short = (d: string) => {
    const [, m, day] = d.split("-");
    return m && day ? `${Number(m)}.${Number(day)}` : undefined;
  };
  const from = short(start);
  if (!from) return undefined;
  const to = end ? short(end) : undefined;
  return !to || to === from ? from : `${from}~${to}`;
}

/**
 * 축제 후보 — 행사 목록은 한 번 받아두고 클라이언트에서 거른다.
 * 목록 API에 keyword 파라미터가 없고, 부산 행사 수가 많지 않아 매번 요청할 이유가 없다.
 */
export function useFestivalSuggestions(keyword: string) {
  const trimmed = keyword.trim();
  const { data, isLoading } = useEvents();

  const suggestions = useMemo<Suggestion[]>(() => {
    if (trimmed.length === 0 || !data) return EMPTY;
    const needle = trimmed.replace(/\s/g, "");
    return data
      .filter((event) => event.title.replace(/\s/g, "").includes(needle))
      .slice(0, SUGGEST_LIMIT)
      .map((event) => ({
        id: event.contentId,
        title: event.title,
        meta: formatPeriod(event.eventStartDate, event.eventEndDate),
        imageUrl: event.firstImage2 ?? event.firstImage,
        badge: "행사",
      }));
  }, [data, trimmed]);

  return { suggestions, isLoading: isLoading && trimmed.length > 0 };
}

const PICKS_LIMIT = 6;

export const courseSpotPickKeys = {
  list: (category: string | undefined) => ["mapPlaces", "spotPicks", category ?? "ALL"] as const,
};

/**
 * 검색어를 치기 전에 보여줄 "부산 가볼 만한 곳" — 고른 지역과 상관없이 부산 전체 스팟 장소(+분류).
 * 사진 있는 곳부터 받으려고 imageUrl 오름차순으로 정렬한다 (스팟 목록과 같은 이유).
 */
export function useSpotPicks(category: string | undefined, enabled: boolean) {
  const { data, isFetching } = useQuery({
    queryKey: courseSpotPickKeys.list(category),
    queryFn: () =>
      fetchMapPlaces({
        ...(category && { category }),
        sort: "imageUrl,asc",
        size: PICKS_LIMIT,
      }),
    enabled,
    staleTime: 1000 * 60 * 5,
    select: toSpotSuggestions,
    placeholderData: keepPreviousData,
  });

  return { picks: data ?? EMPTY, isLoading: isFetching };
}

/** 검색어를 치기 전에 보여줄 "지금·곧 열리는 행사" — 진행 중(곧 끝나는 순) → 예정(곧 시작하는 순) */
export function useActiveFestivalPicks() {
  const { data, isLoading } = useEvents();

  const picks = useMemo<Suggestion[]>(() => {
    if (!data) return EMPTY;
    const today = toDateKey(new Date());
    return sortActiveEvents(data, today)
      .slice(0, PICKS_LIMIT)
      .map((event) => ({
        id: event.contentId,
        title: event.title,
        meta: formatPeriod(event.eventStartDate, event.eventEndDate),
        imageUrl: event.firstImage2 ?? event.firstImage,
        badge: getEventBadge(event, today).label,
      }));
  }, [data]);

  return { picks, isLoading };
}
