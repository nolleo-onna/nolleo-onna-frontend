import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  SEARCHBAR_SELECTION_KEY,
  presetCourseRegion,
  readCourseSelection,
  saveCourseSelection,
} from "./searchBarSelection";

function stubSessionStorage() {
  const store = new Map<string, string>();
  vi.stubGlobal("sessionStorage", {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
    removeItem: (k: string) => void store.delete(k),
  });
  return store;
}

describe("코스 조건 선택 저장", () => {
  let store: Map<string, string>;

  beforeEach(() => {
    store = stubSessionStorage();
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("저장된 게 없으면 빈 값", () => {
    expect(readCourseSelection()).toEqual({});
  });

  it("고른 지역·예산을 저장하고 되살린다", () => {
    saveCourseSelection({ region: "동래" });
    saveCourseSelection({ budget: "UNDER_30K" });
    expect(readCourseSelection()).toEqual({ region: "동래", budget: "UNDER_30K" });
  });

  it("혼잡도 화면이 넣은 행정구역명 지역을 지원 지역으로 맞춘다", () => {
    presetCourseRegion("해운대구");
    expect(readCourseSelection().region).toBe("해운대");
  });

  it("지원하지 않는 지역·모르는 예산은 버린다", () => {
    store.set(SEARCHBAR_SELECTION_KEY, JSON.stringify({ selectedRegion: "서구", budgetTier: "UNDER_1M" }));
    expect(readCourseSelection()).toEqual({ region: undefined, budget: undefined });
  });

  it("다른 값은 건드리지 않고 덮어쓴다", () => {
    store.set(SEARCHBAR_SELECTION_KEY, JSON.stringify({ activeTab: "course", budgetTier: "NONE" }));
    saveCourseSelection({ region: "서면" });
    expect(JSON.parse(store.get(SEARCHBAR_SELECTION_KEY)!)).toEqual({
      activeTab: "course",
      budgetTier: "NONE",
      selectedRegion: "서면",
    });
  });

  it("깨진 JSON이어도 던지지 않는다", () => {
    store.set(SEARCHBAR_SELECTION_KEY, "{not json");
    expect(readCourseSelection()).toEqual({});
  });
});
