"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";

import { EventNotFoundError, fetchEvent, fetchEvents } from "@/libs/api/events";

import type { BusanEvent } from "@/types/event";

export const eventKeys = {
  all: ["events"] as const,
  list: () => [...eventKeys.all, "list"] as const,
  detail: (contentId: string) => [...eventKeys.all, "detail", contentId] as const,
};

// 관광공사 데이터라 자주 바뀌지 않는다
const EVENT_STALE_MS = 1000 * 60 * 30;

export function useEvents() {
  return useQuery({
    queryKey: eventKeys.list(),
    queryFn: fetchEvents,
    staleTime: EVENT_STALE_MS,
  });
}

// 목록에서 들어오면 목록 응답을 그대로 초기값으로 써서 상세가 바로 뜬다(필드가 같다)
export function useEvent(contentId: string) {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: eventKeys.detail(contentId),
    queryFn: () => fetchEvent(contentId),
    enabled: contentId.length > 0,
    staleTime: EVENT_STALE_MS,
    retry: (failureCount, error) => !(error instanceof EventNotFoundError) && failureCount < 2,
    initialData: () =>
      queryClient
        .getQueryData<BusanEvent[]>(eventKeys.list())
        ?.find((event) => event.contentId === contentId),
    initialDataUpdatedAt: () => queryClient.getQueryState(eventKeys.list())?.dataUpdatedAt,
  });
}
