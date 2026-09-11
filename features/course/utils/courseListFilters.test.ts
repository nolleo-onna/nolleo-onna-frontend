import { describe, expect, it } from "vitest";

import {
  applyCourseListControls,
  filterCoursesBySearch,
  parseCostFilter,
  parseSortKey,
} from "./courseListFilters";

import type { MyCourseSummary } from "@/types/course";

function course(overrides: Partial<MyCourseSummary>): MyCourseSummary {
  return {
    id: 1,
    pairId: "pair-1",
    title: "코스",
    description: "",
    totalCost: 0,
    isPublic: false,
    likeCount: 0,
    spotTitles: [],
    ...overrides,
  };
}

describe("parseSortKey", () => {
  it("알려진 값은 그대로 반환한다", () => {
    expect(parseSortKey("cost_low")).toBe("cost_low");
  });

  it("모르는 값이나 null이면 latest로 기본값 처리한다", () => {
    expect(parseSortKey("unknown")).toBe("latest");
    expect(parseSortKey(null)).toBe("latest");
  });
});

describe("parseCostFilter", () => {
  it("알려진 값은 그대로 반환한다", () => {
    expect(parseCostFilter("under3")).toBe("under3");
  });

  it("모르는 값이나 null이면 all로 기본값 처리한다", () => {
    expect(parseCostFilter("free버그")).toBe("all");
    expect(parseCostFilter(null)).toBe("all");
  });
});

describe("applyCourseListControls", () => {
  const courses = [
    course({ id: 1, totalCost: 0, spotTitles: ["a"] }),
    course({ id: 2, totalCost: 30_000, spotTitles: ["a", "b", "c"] }),
    course({ id: 3, totalCost: 80_000, spotTitles: ["a", "b"] }),
  ];

  it("cost 필터로 예산 이하 코스만 남긴다", () => {
    const result = applyCourseListControls(courses, "latest", "under3");
    expect(result.map((c) => c.id)).toEqual([2, 1]);
  });

  it("free 필터는 totalCost가 정확히 0인 코스만 남긴다", () => {
    const result = applyCourseListControls(courses, "latest", "free");
    expect(result.map((c) => c.id)).toEqual([1]);
  });

  it("cost_high로 정렬하면 비싼 코스가 먼저 온다", () => {
    const result = applyCourseListControls(courses, "cost_high", "all");
    expect(result.map((c) => c.id)).toEqual([3, 2, 1]);
  });

  it("spots로 정렬하면 담긴 장소가 많은 코스가 먼저 온다", () => {
    const result = applyCourseListControls(courses, "spots", "all");
    expect(result.map((c) => c.id)).toEqual([2, 3, 1]);
  });

  it("latest는 id 역순(자동증가 id 기준 최신순)이다", () => {
    const result = applyCourseListControls(courses, "latest", "all");
    expect(result.map((c) => c.id)).toEqual([3, 2, 1]);
  });
});

describe("filterCoursesBySearch", () => {
  const courses = [
    course({ id: 1, title: "광안리 야경 코스", description: "", spotTitles: [] }),
    course({ id: 2, title: "해운대 코스", description: "", spotTitles: ["광안리 카페"] }),
    course({ id: 3, title: "서면 맛집", description: "", spotTitles: [] }),
  ];

  it("검색어가 비어있으면 전체를 반환한다", () => {
    expect(filterCoursesBySearch(courses, "")).toHaveLength(3);
  });

  it("제목뿐 아니라 담긴 장소 이름으로도 매칭한다", () => {
    const result = filterCoursesBySearch(courses, "광안리");
    expect(result.map((c) => c.id).sort()).toEqual([1, 2]);
  });

  it("공백을 무시하고 매칭한다", () => {
    const result = filterCoursesBySearch(courses, "광 안리");
    expect(result.map((c) => c.id).sort()).toEqual([1, 2]);
  });
});
