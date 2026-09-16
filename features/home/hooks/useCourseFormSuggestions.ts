"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { fetchMapPlaces } from "@/features/spot/apis/map";
import { useEvents } from "@/features/event/hooks/useEvents";
import type { Suggestion } from "@/features/home/components/SearchBar/SuggestField";

const SUGGEST_LIMIT = 8;
const DEBOUNCE_MS = 250;

/** 한 글자 칠 때마다 요청하지 않도록 입력이 멎은 뒤에만 값을 넘긴다 */
export function useDebouncedValue<T>(value: T, delay = DEBOUNCE_MS): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

export const courseSuggestKeys = {
  spots: (keyword: string) => ["mapPlaces", "suggest", keyword] as const,
};

// 후보가 없을 때 매번 새 배열을 만들면 이 값을 보고 되돌리는 쪽이 계속 다시 그린다
const EMPTY: Suggestion[] = [];

// useQuery 밖에 둬야 참조가 고정돼 select 결과가 캐시된다
const toSpotSuggestions = (page: { content: { originalId: string; name: string; district: string }[] }) =>
  page.content.map(
    (place): Suggestion => ({ id: place.originalId, title: place.name, meta: place.district }),
  );

/** 꼭 포함할 장소 후보 — 서버 keyword 부분 일치 검색 */
export function useSpotSuggestions(keyword: string) {
  const trimmed = keyword.trim();
  const { data, isFetching } = useQuery({
    queryKey: courseSuggestKeys.spots(trimmed),
    queryFn: () => fetchMapPlaces({ keyword: trimmed, size: SUGGEST_LIMIT }),
    enabled: trimmed.length > 0,
    staleTime: 1000 * 60 * 5,
    select: toSpotSuggestions,
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
      }));
  }, [data, trimmed]);

  return { suggestions, isLoading: isLoading && trimmed.length > 0 };
}
