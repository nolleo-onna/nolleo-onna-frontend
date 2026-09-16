import { describe, expect, it } from "vitest";

import { buildCourseNotices } from "./courseNotices";
import type { CourseGenerateApplied, CourseGenerateUnmatched } from "@/types/course";

const applied = (over: Partial<CourseGenerateApplied> = {}): CourseGenerateApplied => ({
  startArea: "광안리",
  budget: { tier: "UNDER_30K", filterRelaxed: false },
  includeSpots: [],
  festival: null,
  ...over,
});

const unmatched = (over: Partial<CourseGenerateUnmatched> = {}): CourseGenerateUnmatched => ({
  includeSpots: [],
  festival: null,
  ...over,
});

describe("buildCourseNotices", () => {
  it("요청대로 다 적용됐으면 알릴 게 없다", () => {
    expect(
      buildCourseNotices({ requestedArea: "광안리", applied: applied(), unmatched: unmatched() }),
    ).toEqual([]);
  });

  it("축제를 찾아 지역이 바뀌면 축제 위치 기준이라고 알린다", () => {
    const notices = buildCourseNotices({
      requestedArea: "광안리",
      applied: applied({
        startArea: "중구",
        festival: { name: "부산불꽃축제", matchedTitle: "제20회 부산불꽃축제", period: "11.1~11.1" },
      }),
      unmatched: unmatched(),
    });

    expect(notices).toHaveLength(1);
    expect(notices[0]).toMatchObject({ id: "area", tone: "info" });
    expect(notices[0].message).toContain("축제 위치(중구)");
  });

  it("축제 없이 지역만 바뀌면 축제를 들먹이지 않는다", () => {
    const [notice] = buildCourseNotices({
      requestedArea: "광안리",
      applied: applied({ startArea: "중구" }),
      unmatched: unmatched(),
    });

    expect(notice.message).toBe("중구 기준으로 만들었어요");
  });

  it("축제를 못 찾으면 입력한 지역 중심으로 만들었다고 알린다", () => {
    const notices = buildCourseNotices({
      requestedArea: "광안리",
      applied: applied(),
      unmatched: unmatched({ festival: "없는축제" }),
    });

    expect(notices).toHaveLength(1);
    expect(notices[0].id).toBe("festival");
    expect(notices[0].message).toContain("'없는축제'");
    expect(notices[0].message).toContain("광안리");
  });

  it("못 찾은 장소는 이름을 모아서 한 줄로 알린다", () => {
    const [notice] = buildCourseNotices({
      requestedArea: "광안리",
      applied: applied(),
      unmatched: unmatched({ includeSpots: ["동백섬 바다", "없는가게"] }),
    });

    expect(notice.id).toBe("spots");
    expect(notice.message).toContain("'동백섬 바다', '없는가게'");
  });

  it("예산 상한을 풀었으면 예산을 넘을 수 있다고 알린다", () => {
    const [notice] = buildCourseNotices({
      requestedArea: "광안리",
      applied: applied({ budget: { tier: "UNDER_10K", filterRelaxed: true } }),
      unmatched: unmatched(),
    });

    expect(notice).toMatchObject({ id: "budget", tone: "warn" });
  });

  it("여러 개면 지역 → 축제 → 장소 → 예산 순으로 쌓인다", () => {
    const notices = buildCourseNotices({
      requestedArea: "광안리",
      applied: applied({ startArea: "중구", budget: { tier: "NONE", filterRelaxed: true } }),
      unmatched: unmatched({ festival: "없는축제", includeSpots: ["없는가게"] }),
    });

    expect(notices.map((n) => n.id)).toEqual(["area", "festival", "spots", "budget"]);
  });
});
