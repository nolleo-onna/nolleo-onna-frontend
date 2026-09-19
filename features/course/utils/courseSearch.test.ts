import { describe, expect, it } from "vitest";

import { filterCourses, sortCourses } from "./courseSearch";

const course = (title: string, spotTitles: string[]) => ({ title, spotTitles });

const COURSES = [
  course("해운대 감성 힐링 코스", ["부산엑스더스카이", "해운대 해변열차"]),
  course("광안리 미식과 낭만 여행", ["약콩밀면", "광안리해수욕장"]),
  course("전포와 서면의 낭만 산책", ["서면1번가", "전포 삼거리"]),
];

describe("filterCourses", () => {
  it("검색어가 없으면 그대로 돌려준다", () => {
    expect(filterCourses(COURSES, "   ")).toHaveLength(3);
  });

  it("코스 이름으로 찾는다", () => {
    expect(filterCourses(COURSES, "해운대").map((c) => c.title)).toEqual(["해운대 감성 힐링 코스"]);
  });

  it("들르는 곳 이름으로도 찾는다 — 제목엔 없어도 된다", () => {
    expect(filterCourses(COURSES, "밀면").map((c) => c.title)).toEqual(["광안리 미식과 낭만 여행"]);
  });

  it("띄어쓰기와 대소문자는 무시한다", () => {
    expect(filterCourses(COURSES, " 해운대해변 ").map((c) => c.title)).toEqual([
      "해운대 감성 힐링 코스",
    ]);
  });

  it("걸리는 게 없으면 빈 목록", () => {
    expect(filterCourses(COURSES, "제주도")).toEqual([]);
  });
});

describe("sortCourses", () => {
  const rows = [
    { createdAt: "2026-09-11T00:00:00", likeCount: 0, viewCount: 9 },
    { createdAt: "2026-09-18T00:00:00", likeCount: 1, viewCount: 1 },
    { createdAt: "2026-09-15T00:00:00", likeCount: 1, viewCount: 5 },
  ];

  it("인기순은 서버가 준 순서를 그대로 둔다", () => {
    expect(sortCourses(rows, "popular")).toBe(rows);
  });

  it("최신순은 만든 날 내림차순", () => {
    expect(sortCourses(rows, "latest").map((r) => r.createdAt.slice(0, 10))).toEqual([
      "2026-09-18",
      "2026-09-15",
      "2026-09-11",
    ]);
  });

  it("좋아요순은 좋아요 → 조회수 순", () => {
    expect(sortCourses(rows, "liked").map((r) => r.viewCount)).toEqual([5, 1, 9]);
  });
});
