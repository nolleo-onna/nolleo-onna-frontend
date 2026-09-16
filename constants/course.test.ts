import { describe, expect, it } from "vitest";

import {
  COURSE_BUDGET_OPTIONS,
  COURSE_START_AREAS,
  courseBudgetAmount,
  isCourseStartArea,
  normalizeStartArea,
} from "./course";

describe("normalizeStartArea", () => {
  it("지원 지역은 그대로 돌려준다", () => {
    expect(normalizeStartArea("광안리")).toBe("광안리");
    expect(normalizeStartArea("부산진구")).toBe("부산진구");
  });

  it("행정구역 접미사를 떼서 맞춘다", () => {
    expect(normalizeStartArea("해운대구")).toBe("해운대");
    expect(normalizeStartArea("기장군")).toBe("기장");
    expect(normalizeStartArea("동래구")).toBe("동래");
    expect(normalizeStartArea("영도구")).toBe("영도");
    // 서버가 받는 표기는 "사상" — "사상구"로 보내면 UNKNOWN_START_AREA가 된다
    expect(normalizeStartArea("사상구")).toBe("사상");
  });

  it("떼고도 못 맞추는 구는 포기한다", () => {
    expect(normalizeStartArea("서구")).toBeUndefined();
    expect(normalizeStartArea("금정구")).toBeUndefined();
  });

  it("빈 값도 안전하게 다룬다", () => {
    expect(normalizeStartArea(undefined)).toBeUndefined();
    expect(normalizeStartArea(null)).toBeUndefined();
    expect(normalizeStartArea("  ")).toBeUndefined();
  });
});

describe("지원 지역 목록", () => {
  it("백엔드가 받는 18개 지역과 같다", () => {
    expect(COURSE_START_AREAS).toHaveLength(18);
    expect(COURSE_START_AREAS).toContain("센텀");
    expect(COURSE_START_AREAS).toContain("송도");
    expect(isCourseStartArea("사상")).toBe(true);
    expect(isCourseStartArea("사상구")).toBe(false);
  });
});

describe("예산 등급", () => {
  it("게이지 기준 금액은 제한없음만 비어 있다", () => {
    expect(courseBudgetAmount("NONE")).toBe(0);
    expect(courseBudgetAmount("UNDER_10K")).toBe(10_000);
    expect(courseBudgetAmount("UNDER_30K")).toBe(30_000);
    expect(courseBudgetAmount("UNDER_50K")).toBe(50_000);
    expect(courseBudgetAmount("UNLIMITED")).toBeUndefined();
  });

  it("명세의 다섯 등급을 모두 고를 수 있다", () => {
    expect(COURSE_BUDGET_OPTIONS.map((o) => o.tier)).toEqual([
      "NONE",
      "UNDER_10K",
      "UNDER_30K",
      "UNDER_50K",
      "UNLIMITED",
    ]);
  });
});
