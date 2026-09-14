import { clientFetch } from "@/libs/clientFetch";

import type { ApiResponse } from "@/types/course";
import type { BusanEvent } from "@/types/event";

/** 없는 행사(404) — 재시도하지 않고 "찾을 수 없어요"를 보여주기 위해 구분한다 */
export class EventNotFoundError extends Error {
  constructor() {
    super("행사를 찾을 수 없어요");
    this.name = "EventNotFoundError";
  }
}

// 행사 목록 — 로그인 불필요. 서버는 정렬 없이 활성 행사 전체를 준다(기간 판정·정렬은 화면에서).
export async function fetchEvents(): Promise<BusanEvent[]> {
  const res = await clientFetch("/api/v1/events", { publicEndpoint: true });
  if (!res.ok) throw new Error("행사 정보를 불러오지 못했어요");
  const json: ApiResponse<BusanEvent[]> = await res.json();
  return json.data ?? [];
}

export async function fetchEvent(contentId: string): Promise<BusanEvent> {
  const res = await clientFetch(`/api/v1/events/${encodeURIComponent(contentId)}`, {
    publicEndpoint: true,
  });
  if (res.status === 404) throw new EventNotFoundError();
  if (!res.ok) throw new Error("행사 정보를 불러오지 못했어요");
  const json: ApiResponse<BusanEvent> = await res.json();
  return json.data;
}
