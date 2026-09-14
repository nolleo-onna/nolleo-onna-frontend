import { describe, expect, it } from "vitest";

import { extractDistrictName, filterEventsByDistrict } from "./regionEvents";

describe("extractDistrictName", () => {
  it("광역시 표기 유무와 상관없이 구·군을 뽑는다", () => {
    expect(extractDistrictName("부산광역시 해운대구 APEC로 55 (우동)")).toBe("해운대구");
    expect(extractDistrictName("부산 수영구 광안해변로 219")).toBe("수영구");
    expect(extractDistrictName("부산광역시 기장군 기장읍 대변리")).toBe("기장군");
    expect(extractDistrictName("부산광역시 중구")).toBe("중구");
  });

  it("주소가 없거나 부산이 아니면 null", () => {
    expect(extractDistrictName(null)).toBeNull();
    expect(extractDistrictName("서울특별시 중구 세종대로 110")).toBeNull();
  });
});

describe("filterEventsByDistrict", () => {
  it("동네의 행정구와 같은 구의 행사만 남긴다 — 부산진구가 진구·동구와 헷갈리지 않는다", () => {
    const events = [
      { addr1: "부산광역시 부산진구 전포대로 1", title: "서면" },
      { addr1: "부산광역시 동구 중앙대로 206", title: "원도심" },
      { addr1: "부산광역시 해운대구 APEC로 55", title: "벡스코" },
    ];
    expect(filterEventsByDistrict(events, "DONG_GU").map((e) => e.title)).toEqual(["원도심"]);
    expect(filterEventsByDistrict(events, "BUSANJIN_GU").map((e) => e.title)).toEqual(["서면"]);
  });
});
