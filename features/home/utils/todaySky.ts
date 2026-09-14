import { ptyLabelMap } from "@/types/weather";

import type { DistrictSummary } from "@/features/home/utils/districtWeather";
import type { PtyCode } from "@/types/weather";

export type SkyPhase = "dawn" | "day" | "dusk" | "night";

export const SKY_PHASE_LABEL: Record<SkyPhase, string> = {
  dawn: "이른 아침",
  day: "낮",
  dusk: "해질녘",
  night: "밤",
};

/** 시각(0~23시)으로 하늘 배경 시간대를 고른다 — 5~7시 이른 아침, 7~17시 낮, 17~19시 해질녘, 그 외 밤 */
export function getSkyPhase(hour: number): SkyPhase {
  if (hour >= 5 && hour < 7) return "dawn";
  if (hour >= 7 && hour < 17) return "day";
  if (hour >= 17 && hour < 19) return "dusk";
  return "night";
}

/** 강수 없음(0)은 시간대에 맞춰 부르고, 비·눈은 기상청 표기 그대로 쓴다 */
export function describeSky(pty: PtyCode, phase: SkyPhase): string {
  if (pty !== 0) return ptyLabelMap[pty];
  if (phase === "night") return "맑은 밤";
  if (phase === "dusk") return "맑은 저녁";
  return "맑음";
}

export function describeRain(pty: PtyCode, rn1: number | null): string {
  if (rn1 === null) return "강수량 정보 없음";
  if (rn1 > 0) return `시간당 ${rn1}mm`;
  return pty === 0 ? "비 소식 없어요" : "약하게 내려요";
}

/** 풍속(m/s) → 체감 문구와 0~3 세기. 세기 2 이상이면 하늘에 바람 줄기를 그린다 */
export function describeWind(wsd: number | null): { label: string; level: 0 | 1 | 2 | 3 } | null {
  if (wsd === null) return null;
  if (wsd < 1.5) return { label: "잔잔해요", level: 0 };
  if (wsd < 4) return { label: "산들바람", level: 1 };
  if (wsd < 9) return { label: "바람 좀 불어요", level: 2 };
  return { label: "바람 강해요", level: 3 };
}

/** 바람개비 한 바퀴 시간(초). 바람이 셀수록 빨리 돌고, 없으면 멈춘다 */
export function windSpinSeconds(wsd: number | null): number | null {
  if (wsd === null || wsd <= 0) return null;
  return Math.min(6, Math.max(0.35, 4 / wsd));
}

export function describeHumidity(reh: number | null): string | null {
  if (reh === null) return null;
  if (reh < 40) return "건조해요";
  if (reh < 70) return "쾌적해요";
  return "습해요";
}

/** 혼잡도가 있는 구 중 가장 한산한 곳 */
export function findCalmestDistrict(list: DistrictSummary[]): DistrictSummary | null {
  return list.reduce<DistrictSummary | null>((calmest, item) => {
    if (item.congestionRate === null) return calmest;
    if (!calmest || calmest.congestionRate === null || item.congestionRate < calmest.congestionRate) return item;
    return calmest;
  }, null);
}

export function getTemperatureRange(list: DistrictSummary[]): { min: number; max: number } | null {
  const temps = list.map((item) => item.tmp).filter((tmp): tmp is number => tmp !== null);
  if (temps.length === 0) return null;
  return { min: Math.min(...temps), max: Math.max(...temps) };
}
