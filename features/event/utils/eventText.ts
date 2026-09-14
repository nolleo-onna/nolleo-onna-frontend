import { getEventStatus, sortActiveEvents } from "@/features/event/utils/eventSchedule";
import { extractDistrictName } from "@/features/hankkut/utils/regionEvents";

import type { EventStatus } from "@/features/event/utils/eventSchedule";
import type { BusanEvent } from "@/types/event";

type EventPeriod = Pick<BusanEvent, "eventStartDate" | "eventEndDate">;

const DAY_MS = 24 * 60 * 60 * 1000;
const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

function toUtc(date: string): number {
  const [y, m, d] = date.split("-").map(Number);
  return Date.UTC(y, m - 1, d);
}

/** "2026-09-04" → "9.4 (금)" */
export function formatDateWithWeekday(date: string): string {
  const [, m, d] = date.split("-").map(Number);
  return `${m}.${d} (${WEEKDAYS[new Date(toUtc(date)).getUTCDay()]})`;
}

/** "9.4 (금) – 9.19 (토)" · 하루짜리는 날짜 하나 · 해가 넘어가면 양쪽에 연도 */
export function formatPeriodWithWeekday(start: string, end: string): string {
  if (start === end) return formatDateWithWeekday(start);
  const sy = start.slice(0, 4);
  const ey = end.slice(0, 4);
  if (sy !== ey) {
    return `${sy}. ${formatDateWithWeekday(start)} – ${ey}. ${formatDateWithWeekday(end)}`;
  }
  return `${formatDateWithWeekday(start)} – ${formatDateWithWeekday(end)}`;
}

export interface EventProgress {
  status: EventStatus;
  /** 행사 일수 — 시작일·종료일 포함 */
  totalDays: number;
  /** 진행 중이면 오늘이 몇째 날인지(1부터) */
  dayNumber: number;
  /** 진행 중이면 오늘 이후 남은 날 (마지막 날이면 0) */
  daysLeft: number;
  /** 예정이면 시작까지 남은 날 */
  daysUntil: number;
  /** 진행 막대 채움 비율 0~1 */
  ratio: number;
}

export function getEventProgress(event: EventPeriod, today: string): EventProgress {
  const status = getEventStatus(event, today);
  const start = toUtc(event.eventStartDate);
  const totalDays = Math.round((toUtc(event.eventEndDate) - start) / DAY_MS) + 1;

  if (status === "upcoming") {
    const daysUntil = Math.round((start - toUtc(today)) / DAY_MS);
    return { status, totalDays, dayNumber: 0, daysLeft: totalDays, daysUntil, ratio: 0 };
  }
  if (status === "ended") {
    return { status, totalDays, dayNumber: totalDays, daysLeft: 0, daysUntil: 0, ratio: 1 };
  }
  const dayNumber = Math.round((toUtc(today) - start) / DAY_MS) + 1;
  return {
    status,
    totalDays,
    dayNumber,
    daysLeft: totalDays - dayNumber,
    daysUntil: 0,
    ratio: dayNumber / totalDays,
  };
}

/** 한 줄에 "- A 1원 - B 2원"처럼 붙어 온 항목과 "※" 안내도 줄로 나눈다 */
function splitItems(text: string): string[] {
  return text
    .split(/\r?\n/)
    .flatMap((line) => line.split(/\s+(?=-\s)|\s+(?=※)/))
    .map((line) => line.trim())
    .filter(Boolean);
}

/** 운영 시간처럼 "- " 목록으로 오는 문구를 줄 배열로 */
export function splitListLines(text: string | null): string[] {
  if (!text) return [];
  return splitItems(text).map((line) => line.replace(/^-\s*/, ""));
}

export type FeeLine =
  | { kind: "heading"; text: string }
  | { kind: "item"; label: string; price: string }
  | { kind: "note"; text: string }
  | { kind: "text"; text: string };

// "성인 13,000원" · "S그룹 : 80,000원" · "국가유공자 5,500" · "장애인/아동 무료"
const PRICE_AT_END = /^(.+?)[\s:：]+(\d[\d,]*(?:\s*~\s*\d[\d,]*)?\s*원?|무료)$/;

function normalizePrice(raw: string): string {
  const price = raw.replace(/\s+/g, "");
  return price === "무료" || price.endsWith("원") ? price : `${price}원`;
}

/**
 * 관광공사 요금 문구(자유 형식)를 표로 그릴 수 있게 나눈다.
 * "[라이브공연]" → 소제목, "- 성인 13,000원" → 항목·가격, "※ …" → 안내, 나머지는 문장 그대로.
 */
export function parseFeeLines(text: string | null): FeeLine[] {
  if (!text) return [];
  return splitItems(text).map((raw): FeeLine => {
    if (/^\[.+\]$/.test(raw)) return { kind: "heading", text: raw.slice(1, -1).trim() };
    if (raw.startsWith("※")) return { kind: "note", text: raw.replace(/^※\s*/, "") };
    const body = raw.replace(/^-\s*/, "");
    const match = raw.startsWith("-") ? body.match(PRICE_AT_END) : null;
    if (match) {
      return {
        kind: "item",
        label: match[1].trim().replace(/\s*[:：]\s*/g, " · "),
        price: normalizePrice(match[2]),
      };
    }
    return { kind: "text", text: body };
  });
}

function firstAmount(price: string): number | null {
  const digits = price.match(/\d[\d,]*/)?.[0].replace(/,/g, "");
  return digits ? Number(digits) : null;
}

/** 요금 한 줄 요약 — "무료" · 가격이 하나면 그 값 · 여럿이면 가장 싼 값 "부터" · 해석 못 하면 첫 줄 */
export function summarizeFee(text: string | null): string | null {
  const trimmed = text?.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("무료")) return trimmed.includes("유료") ? "무료 · 일부 유료" : "무료";

  const itemAmounts = parseFeeLines(trimmed)
    .flatMap((line) => (line.kind === "item" && line.price !== "무료" ? [firstAmount(line.price)] : []))
    .filter((amount): amount is number => amount !== null);
  const amounts =
    itemAmounts.length > 0
      ? itemAmounts
      : [...trimmed.matchAll(/(\d[\d,]*)\s*원/g)].map((m) => Number(m[1].replace(/,/g, "")));

  if (amounts.length === 0) return splitItems(trimmed)[0]?.replace(/^-\s*/, "") ?? null;
  const min = Math.min(...amounts).toLocaleString("ko-KR");
  return amounts.length === 1 ? `${min}원` : `${min}원부터`;
}

/** 지금 갈 수 있는 다른 행사 — 같은 구에서 열리는 것 먼저, 그다음 진행 중 → 곧 시작 순 */
export function getRelatedEvents(
  events: BusanEvent[],
  current: BusanEvent,
  today: string,
  limit = 4,
): BusanEvent[] {
  const district = extractDistrictName(current.addr1);
  const active = sortActiveEvents(
    events.filter((event) => event.contentId !== current.contentId),
    today,
  );
  const sameDistrict = district
    ? active.filter((event) => extractDistrictName(event.addr1) === district)
    : [];
  const others = active.filter((event) => !sameDistrict.includes(event));
  return [...sameDistrict, ...others].slice(0, limit);
}
