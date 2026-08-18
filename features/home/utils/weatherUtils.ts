import type { PtyCode, WeatherObservation } from "@/types/weather";

const AVG_KEYS = ["tmp", "reh", "wsd", "rn1"] as const;
type AvgKey = (typeof AVG_KEYS)[number];

// 값이 없는(null) 구는 평균에서 제외. 전부 없으면 null 그대로 반환
function average(list: WeatherObservation[], key: AvgKey): number | null {
  const values = list.map((item) => item[key]).filter((v): v is number => v !== null);
  if (values.length === 0) return null;
  const sum = values.reduce((acc, v) => acc + v, 0);
  return Math.round((sum / values.length) * 10) / 10;
}

// district를 지정하면 해당 구 데이터를, 지정하지 않으면 전체 구를 집계한 "부산 전체" 값을 만들어줌
// (pty는 평균이 의미 없어서 강수 있는 쪽을 우선으로 대표값 선정)
export function pickDistrictWeather(
  list: WeatherObservation[] | undefined,
  district?: string,
): WeatherObservation | undefined {
  if (!list || list.length === 0) return undefined;

  if (district) {
    return list.find((item) => item.district === district) ?? list[0];
  }

  if (list.length === 1) return list[0];

  const worstPty = list.reduce<PtyCode>(
    (worst, item) => (item.pty > worst ? item.pty : worst),
    0,
  );

  return {
    district: "부산 전체",
    tmp: average(list, "tmp"),
    reh: average(list, "reh"),
    wsd: average(list, "wsd"),
    rn1: average(list, "rn1"),
    pty: worstPty,
  };
}
