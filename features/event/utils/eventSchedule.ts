import type { BusanEvent } from "@/types/event";

export type EventStatus = "ongoing" | "upcoming" | "ended";

export interface EventBadge {
  status: EventStatus;
  label: string;
  /** 진행 중이면서 곧 끝나는 행사 — 배지를 강조색으로 */
  endingSoon: boolean;
}

type EventPeriod = Pick<BusanEvent, "eventStartDate" | "eventEndDate">;

const DAY_MS = 24 * 60 * 60 * 1000;
const ENDING_SOON_DAYS = 7;

/** 기기 날짜를 서버 날짜 형식(YYYY-MM-DD)으로 — 같은 형식끼리 문자열 비교로 기간을 판정한다 */
export function toDateKey(date: Date): string {
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${mm}-${dd}`;
}

function daysBetween(from: string, to: string): number {
  const [fy, fm, fd] = from.split("-").map(Number);
  const [ty, tm, td] = to.split("-").map(Number);
  return Math.round((Date.UTC(ty, tm - 1, td) - Date.UTC(fy, fm - 1, fd)) / DAY_MS);
}

/** 시작일·종료일 당일은 진행 중으로 본다 */
export function getEventStatus(event: EventPeriod, today: string): EventStatus {
  if (event.eventEndDate < today) return "ended";
  if (event.eventStartDate > today) return "upcoming";
  return "ongoing";
}

/** 카드 배지 — 진행 중: 오늘 마감 / 마감 D-n / 진행 중 · 예정: 내일 시작 / D-n · 종료 */
export function getEventBadge(event: EventPeriod, today: string): EventBadge {
  const status = getEventStatus(event, today);
  if (status === "ended") return { status, label: "종료", endingSoon: false };
  if (status === "upcoming") {
    const until = daysBetween(today, event.eventStartDate);
    return { status, label: until === 1 ? "내일 시작" : `D-${until}`, endingSoon: false };
  }
  const left = daysBetween(today, event.eventEndDate);
  if (left === 0) return { status, label: "오늘 마감", endingSoon: true };
  if (left <= ENDING_SOON_DAYS) return { status, label: `마감 D-${left}`, endingSoon: true };
  return { status, label: "진행 중", endingSoon: false };
}

export interface GroupedEvents<T extends EventPeriod> {
  /** 곧 끝나는 순 */
  ongoing: T[];
  /** 곧 시작하는 순 */
  upcoming: T[];
  /** 최근에 끝난 순 */
  ended: T[];
}

export function groupEventsByStatus<T extends EventPeriod>(events: T[], today: string): GroupedEvents<T> {
  const grouped: GroupedEvents<T> = { ongoing: [], upcoming: [], ended: [] };
  events.forEach((event) => grouped[getEventStatus(event, today)].push(event));
  grouped.ongoing.sort((a, b) => a.eventEndDate.localeCompare(b.eventEndDate));
  grouped.upcoming.sort((a, b) => a.eventStartDate.localeCompare(b.eventStartDate));
  grouped.ended.sort((a, b) => b.eventEndDate.localeCompare(a.eventEndDate));
  return grouped;
}

/** 지금 갈 수 있거나 곧 열리는 행사 — 진행 중(곧 끝나는 순) 다음 예정(곧 시작하는 순) */
export function sortActiveEvents<T extends EventPeriod>(events: T[], today: string): T[] {
  const { ongoing, upcoming } = groupEventsByStatus(events, today);
  return [...ongoing, ...upcoming];
}

/** "2026.09.04 – 09.19" · 하루짜리면 날짜 하나 · 해가 넘어가면 종료일에도 연도 */
export function formatEventPeriod(start: string, end: string): string {
  const [sy, sm, sd] = start.split("-");
  const [ey, em, ed] = end.split("-");
  const from = `${sy}.${sm}.${sd}`;
  if (start === end) return from;
  return sy === ey ? `${from} – ${em}.${ed}` : `${from} – ${ey}.${em}.${ed}`;
}
