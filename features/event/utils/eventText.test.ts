import { describe, expect, it } from "vitest";

import {
  formatDateWithWeekday,
  formatPeriodWithWeekday,
  getEventProgress,
  getRelatedEvents,
  parseFeeLines,
  splitListLines,
  summarizeFee,
} from "./eventText";

import type { BusanEvent } from "@/types/event";

// 기준: 2026-09-08은 화요일 (서비스 화면 날짜로 확인)
describe("formatDateWithWeekday / formatPeriodWithWeekday", () => {
  it("월.일 (요일)로 쓴다", () => {
    expect(formatDateWithWeekday("2026-09-08")).toBe("9.8 (화)");
    expect(formatDateWithWeekday("2026-09-04")).toBe("9.4 (금)");
    expect(formatDateWithWeekday("2026-12-06")).toBe("12.6 (일)");
  });

  it("같은 해 기간 · 하루짜리 · 해 넘김", () => {
    expect(formatPeriodWithWeekday("2026-09-04", "2026-09-19")).toBe("9.4 (금) – 9.19 (토)");
    expect(formatPeriodWithWeekday("2026-12-06", "2026-12-06")).toBe("12.6 (일)");
    expect(formatPeriodWithWeekday("2026-12-31", "2027-01-02")).toBe("2026. 12.31 (목) – 2027. 1.2 (토)");
  });
});

describe("getEventProgress", () => {
  const camp = { eventStartDate: "2026-09-04", eventEndDate: "2026-09-19" };

  it("진행 중이면 며칠째·남은 날·채움 비율", () => {
    expect(getEventProgress(camp, "2026-09-14")).toEqual({
      status: "ongoing",
      totalDays: 16,
      dayNumber: 11,
      daysLeft: 5,
      daysUntil: 0,
      ratio: 11 / 16,
    });
    expect(getEventProgress(camp, "2026-09-19")).toMatchObject({ dayNumber: 16, daysLeft: 0, ratio: 1 });
  });

  it("예정이면 시작까지 남은 날, 종료면 가득 찬 막대", () => {
    expect(getEventProgress(camp, "2026-08-31")).toMatchObject({ status: "upcoming", daysUntil: 4, ratio: 0 });
    expect(getEventProgress(camp, "2026-09-20")).toMatchObject({ status: "ended", ratio: 1 });
  });
});

describe("parseFeeLines", () => {
  it("소제목·항목·안내를 나눈다", () => {
    expect(
      parseFeeLines("[라이브공연]\n- 성인 13,000원\n- 아동 5,000원\n※ 일부 무료 객석 및 자세한 행사 요금은 문의 요망"),
    ).toEqual([
      { kind: "heading", text: "라이브공연" },
      { kind: "item", label: "성인", price: "13,000원" },
      { kind: "item", label: "아동", price: "5,000원" },
      { kind: "note", text: "일부 무료 객석 및 자세한 행사 요금은 문의 요망" },
    ]);
  });

  it("한 줄에 붙어 온 항목을 쪼개고, 원 없는 가격·무료·콜론 라벨을 정리한다", () => {
    expect(parseFeeLines("- S플러스 그룹 : 130,000원 - S그룹 : 80,000원 - A~F(일반) 그룹 : 60,000원")).toEqual([
      { kind: "item", label: "S플러스 그룹", price: "130,000원" },
      { kind: "item", label: "S그룹", price: "80,000원" },
      { kind: "item", label: "A~F(일반) 그룹", price: "60,000원" },
    ]);
    expect(parseFeeLines("- 성인/청소년 11,000원 - 국가유공자 5,500 - 장애인/아동 무료")).toEqual([
      { kind: "item", label: "성인/청소년", price: "11,000원" },
      { kind: "item", label: "국가유공자", price: "5,500원" },
      { kind: "item", label: "장애인/아동", price: "무료" },
    ]);
    expect(parseFeeLines("- 사전 예매 시 : 성인 기준 5,000원")).toEqual([
      { kind: "item", label: "사전 예매 시 · 성인 기준", price: "5,000원" },
    ]);
  });

  it("목록이 아닌 문장은 그대로 둔다", () => {
    expect(parseFeeLines("10,000원(할인 예매 진행 시 5,000원)")).toEqual([
      { kind: "text", text: "10,000원(할인 예매 진행 시 5,000원)" },
    ]);
    expect(parseFeeLines(null)).toEqual([]);
  });
});

describe("summarizeFee", () => {
  it("무료 · 가장 싼 값부터 · 가격 하나", () => {
    expect(summarizeFee("무료")).toBe("무료");
    expect(summarizeFee("무료 (일부 프로그램 유료, 야외방탈출 10,000원)")).toBe("무료 · 일부 유료");
    expect(summarizeFee("[라이브공연]\n- 성인 13,000원\n- 아동 5,000원")).toBe("5,000원부터");
    expect(summarizeFee("- 현장 구매 : 7,000원")).toBe("7,000원");
  });

  it("목록이 아니면 문장 속 금액으로, 금액이 없으면 첫 줄로", () => {
    expect(summarizeFee("10,000원(할인 예매 진행 시 5,000원)")).toBe("5,000원부터");
    expect(summarizeFee("유료")).toBe("유료");
    expect(summarizeFee(null)).toBeNull();
  });
});

describe("splitListLines", () => {
  it("목록 기호를 떼고 줄로 나눈다", () => {
    expect(splitListLines("- 하절기(3월~9월) 20:00, 22:00\n- 동절기(10월~2월) 19:00, 21:00")).toEqual([
      "하절기(3월~9월) 20:00, 22:00",
      "동절기(10월~2월) 19:00, 21:00",
    ]);
    expect(splitListLines("11:00 ~ 18:00 (입장 마감 17:30)")).toEqual(["11:00 ~ 18:00 (입장 마감 17:30)"]);
  });
});

describe("getRelatedEvents", () => {
  const base = (contentId: string, addr1: string, eventStartDate: string, eventEndDate: string) =>
    ({ contentId, addr1, eventStartDate, eventEndDate, title: contentId }) as BusanEvent;

  it("같은 구 행사를 먼저, 현재 행사와 종료된 행사는 뺀다", () => {
    const current = base("current", "부산광역시 사하구 다대동 1674", "2026-09-04", "2026-09-19");
    const events = [
      current,
      base("other-ongoing", "부산광역시 수영구 광안해변로", "2026-09-01", "2026-09-30"),
      base("saha-upcoming", "부산광역시 사하구 낙동남로", "2026-09-19", "2026-10-11"),
      base("saha-ended", "부산광역시 사하구 다대동", "2026-08-01", "2026-08-02"),
    ];
    expect(getRelatedEvents(events, current, "2026-09-14").map((e) => e.contentId)).toEqual([
      "saha-upcoming",
      "other-ongoing",
    ]);
  });
});
