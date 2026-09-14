import { describe, expect, it } from "vitest";

import { buildCourseShareText } from "./courseShareText";

const places = [
  { name: "흰여울문화마을", lat: 35.0781, lng: 129.0452, expectedCost: 0, distanceFromPrevM: 0 },
  { name: "태종대", lat: 35.0531, lng: 129.0874, expectedCost: 15000, distanceFromPrevM: 4200 },
];

describe("buildCourseShareText", () => {
  it("카카오맵 링크는 한글 이름을 그대로 두고 공백·쉼표만 바꾼다", () => {
    const text = buildCourseShareText({
      title: "t",
      places: [{ name: "영도 카페, 거리", lat: 35.1, lng: 129.1 }],
    });
    expect(text).toContain("   https://map.kakao.com/link/map/영도%20카페%20거리,35.1,129.1");
  });

  it("제목 · 소개 · 요약 · 장소별 비용과 카카오맵 링크를 담는다", () => {
    expect(buildCourseShareText({ title: "영도 바다 산책", description: "조용한 오후 코스", places })).toBe(
      [
        "[놀러온나] 영도 바다 산책",
        "조용한 오후 코스",
        "",
        "2곳 · 총 4.2km · 예상 비용 15,000원",
        "1. 흰여울문화마을 · 무료",
        "   https://map.kakao.com/link/map/흰여울문화마을,35.0781,129.0452",
        "2. 태종대 · 15,000원",
        "   https://map.kakao.com/link/map/태종대,35.0531,129.0874",
      ].join("\n"),
    );
  });

  it("사이트 링크는 있을 때만 끝에 붙이고, 비어 있는 소개와 거리 0은 생략한다", () => {
    const text = buildCourseShareText({
      title: "영도",
      description: "  ",
      places: [{ ...places[0], distanceFromPrevM: 0 }],
      siteUrl: "https://www.nolleo-onna.site/course/shared/abc",
    });
    expect(text.split("\n")[1]).toBe("");
    expect(text).toContain("1곳 · 예상 비용 무료");
    expect(text.endsWith("놀러온나에서 보기: https://www.nolleo-onna.site/course/shared/abc")).toBe(true);
    expect(buildCourseShareText({ title: "영도", places })).not.toContain("놀러온나에서 보기");
  });
});
