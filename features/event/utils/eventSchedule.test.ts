import { describe, expect, it } from "vitest";

import {
  formatEventPeriod,
  getEventBadge,
  getEventStatus,
  groupEventsByStatus,
  sortActiveEvents,
} from "./eventSchedule";

const TODAY = "2026-09-14";
const period = (eventStartDate: string, eventEndDate: string, title = "") => ({
  eventStartDate,
  eventEndDate,
  title,
});

describe("getEventStatus", () => {
  it("시작일·종료일 당일은 진행 중으로 본다", () => {
    expect(getEventStatus(period(TODAY, "2026-09-20"), TODAY)).toBe("ongoing");
    expect(getEventStatus(period("2026-09-01", TODAY), TODAY)).toBe("ongoing");
  });

  it("시작 전은 예정, 종료일이 지나면 종료", () => {
    expect(getEventStatus(period("2026-09-15", "2026-09-16"), TODAY)).toBe("upcoming");
    expect(getEventStatus(period("2026-09-01", "2026-09-13"), TODAY)).toBe("ended");
  });
});

describe("getEventBadge", () => {
  it("진행 중 행사는 남은 기간에 따라 오늘 마감 / 마감 D-n / 진행 중", () => {
    expect(getEventBadge(period("2026-09-01", TODAY), TODAY)).toMatchObject({ label: "오늘 마감", endingSoon: true });
    expect(getEventBadge(period("2026-09-01", "2026-09-19"), TODAY)).toMatchObject({ label: "마감 D-5", endingSoon: true });
    expect(getEventBadge(period("2026-01-01", "2026-12-31"), TODAY)).toMatchObject({ label: "진행 중", endingSoon: false });
  });

  it("예정 행사는 내일 시작 / D-n, 달이 넘어가도 날짜 차이를 맞게 센다", () => {
    expect(getEventBadge(period("2026-09-15", "2026-09-16"), TODAY).label).toBe("내일 시작");
    expect(getEventBadge(period("2026-10-02", "2026-10-04"), "2026-09-28").label).toBe("D-4");
  });

  it("종료된 행사는 종료", () => {
    expect(getEventBadge(period("2026-08-01", "2026-08-02"), TODAY).label).toBe("종료");
  });
});

describe("groupEventsByStatus / sortActiveEvents", () => {
  const events = [
    period("2026-01-01", "2026-12-31", "드론쇼"),
    period("2026-10-02", "2026-10-04", "록페"),
    period("2026-08-01", "2026-08-02", "지난 행사"),
    period("2026-09-04", "2026-09-19", "캠크닉"),
    period("2026-09-15", "2026-09-17", "컨퍼런스"),
  ];

  it("진행 중은 곧 끝나는 순, 예정은 곧 시작하는 순으로 묶는다", () => {
    const { ongoing, upcoming, ended } = groupEventsByStatus(events, TODAY);
    expect(ongoing.map((e) => e.title)).toEqual(["캠크닉", "드론쇼"]);
    expect(upcoming.map((e) => e.title)).toEqual(["컨퍼런스", "록페"]);
    expect(ended.map((e) => e.title)).toEqual(["지난 행사"]);
  });

  it("활성 목록은 진행 중 다음 예정이고 종료는 뺀다", () => {
    expect(sortActiveEvents(events, TODAY).map((e) => e.title)).toEqual(["캠크닉", "드론쇼", "컨퍼런스", "록페"]);
  });
});

describe("formatEventPeriod", () => {
  it("같은 해는 종료일 연도를 생략하고, 하루짜리는 날짜 하나만", () => {
    expect(formatEventPeriod("2026-09-04", "2026-09-19")).toBe("2026.09.04 – 09.19");
    expect(formatEventPeriod("2026-12-06", "2026-12-06")).toBe("2026.12.06");
  });

  it("해가 넘어가면 종료일에도 연도를 붙인다", () => {
    expect(formatEventPeriod("2026-12-20", "2027-01-05")).toBe("2026.12.20 – 2027.01.05");
  });
});
