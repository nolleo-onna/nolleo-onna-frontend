import { describe, expect, it } from "vitest";

import { getCrowdLevel, getCrowdTiers } from "./crowdUtils";

describe("getCrowdLevel", () => {
  it("절대 기준으로 등급을 나눈다", () => {
    expect(getCrowdLevel(85)).toBe("매우혼잡");
    expect(getCrowdLevel(70)).toBe("매우혼잡");
    expect(getCrowdLevel(69.9)).toBe("혼잡");
    expect(getCrowdLevel(30)).toBe("보통");
    expect(getCrowdLevel(29.9)).toBe("여유");
  });
});

describe("getCrowdTiers", () => {
  // 2026-09-19 운영 API 실제 값 — 48~85%에 몰려 있어 절대 기준으로는 모두 혼잡 이상이다
  const REAL = [
    { district: "해운대구", rate: 85.2 },
    { district: "중구", rate: 80.7 },
    { district: "부산진구", rate: 77.0 },
    { district: "동래구", rate: 75.4 },
    { district: "수영구", rate: 73.5 },
    { district: "사하구", rate: 68.4 },
    { district: "영도구", rate: 67.4 },
    { district: "연제구", rate: 65.2 },
    { district: "북구", rate: 61.7 },
    { district: "기장군", rate: 61.1 },
    { district: "강서구", rate: 54.3 },
    { district: "사상구", rate: 48.2 },
  ];

  it("덜 붐비는 곳이 0등급(초록), 가장 붐비는 곳이 3등급(빨강)", () => {
    const tiers = getCrowdTiers(REAL);
    expect(tiers["사상구"]).toBe(0);
    expect(tiers["강서구"]).toBe(0);
    expect(tiers["해운대구"]).toBe(3);
    expect(tiers["중구"]).toBe(3);
  });

  it("값이 한쪽에 몰려도 네 등급이 모두 나온다", () => {
    const used = new Set(Object.values(getCrowdTiers(REAL)));
    expect([...used].sort()).toEqual([0, 1, 2, 3]);
  });

  it("구가 적어도 등급을 매긴다", () => {
    const tiers = getCrowdTiers([
      { district: "가", rate: 10 },
      { district: "나", rate: 90 },
    ]);
    expect(tiers["가"]).toBe(0);
    expect(tiers["나"]).toBe(3);
  });

  it("빈 목록이면 빈 값", () => {
    expect(getCrowdTiers([])).toEqual({});
  });
});
