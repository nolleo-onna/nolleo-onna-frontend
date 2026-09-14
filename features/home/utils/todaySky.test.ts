import { describe, expect, it } from "vitest";

import {
  describeHumidity,
  describeRain,
  describeSky,
  describeWind,
  findCalmestDistrict,
  getSkyPhase,
  getTemperatureRange,
  windSpinSeconds,
} from "./todaySky";

import type { DistrictSummary } from "./districtWeather";

const district = (name: string, tmp: number | null, rate: number | null): DistrictSummary => ({
  district: name,
  tmp,
  pty: 0,
  rn1: 0,
  reh: 60,
  wsd: 1,
  congestionRate: rate,
  congestionLevel: null,
});

describe("getSkyPhase", () => {
  it("이른 아침·낮·해질녘·밤 경계 시각을 나눈다", () => {
    expect([4, 5, 6, 7, 16, 17, 18, 19, 0].map(getSkyPhase)).toEqual([
      "night", "dawn", "dawn", "day", "day", "dusk", "dusk", "night", "night",
    ]);
  });
});

describe("describeSky / describeRain", () => {
  it("강수 없음은 시간대에 맞춰, 비·눈은 그대로 부른다", () => {
    expect(describeSky(0, "day")).toBe("맑음");
    expect(describeSky(0, "dusk")).toBe("맑은 저녁");
    expect(describeSky(0, "night")).toBe("맑은 밤");
    expect(describeSky(1, "night")).toBe("비");
  });

  it("강수량이 없거나 모르면 그에 맞는 문구를 쓴다", () => {
    expect(describeRain(0, null)).toBe("강수량 정보 없음");
    expect(describeRain(1, 2.5)).toBe("시간당 2.5mm");
    expect(describeRain(0, 0)).toBe("비 소식 없어요");
    expect(describeRain(1, 0)).toBe("약하게 내려요");
  });
});

describe("describeWind / windSpinSeconds", () => {
  it("풍속 경계마다 세기를 올린다", () => {
    expect(describeWind(null)).toBeNull();
    expect([0.7, 1.5, 4, 9].map((w) => describeWind(w)?.level)).toEqual([0, 1, 2, 3]);
  });

  it("바람이 셀수록 빨리 돌되 0.35~6초 사이로 묶는다", () => {
    expect(windSpinSeconds(null)).toBeNull();
    expect(windSpinSeconds(0)).toBeNull();
    expect(windSpinSeconds(1)).toBe(4);
    expect(windSpinSeconds(0.3)).toBe(6);
    expect(windSpinSeconds(20)).toBe(0.35);
  });
});

describe("describeHumidity", () => {
  it("40% 미만 건조, 70% 미만 쾌적, 그 이상 습함", () => {
    expect(describeHumidity(null)).toBeNull();
    expect([39, 40, 69, 70].map(describeHumidity)).toEqual(["건조해요", "쾌적해요", "쾌적해요", "습해요"]);
  });
});

describe("findCalmestDistrict / getTemperatureRange", () => {
  const list = [district("수영구", 23, 45.9), district("기장군", null, 30.1), district("중구", 26, null)];

  it("혼잡도 없는 구는 건너뛰고 가장 낮은 곳을 고른다", () => {
    expect(findCalmestDistrict(list)?.district).toBe("기장군");
    expect(findCalmestDistrict([district("중구", 26, null)])).toBeNull();
  });

  it("기온이 없는 구는 빼고 최저·최고를 구한다", () => {
    expect(getTemperatureRange(list)).toEqual({ min: 23, max: 26 });
    expect(getTemperatureRange([district("기장군", null, 30)])).toBeNull();
  });
});
