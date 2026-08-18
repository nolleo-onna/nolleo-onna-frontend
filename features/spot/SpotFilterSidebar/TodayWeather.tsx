"use client";

import { useWeather } from "@/features/home/hooks/useWeather";
import { pickDistrictWeather } from "@/features/home/utils/weatherUtils";
import { ptyEmojiMap, ptyLabelMap } from "@/types/weather";

// 기상청 풍속(m/s) 구간을 사람 말로 변환
function windLabel(wsd: number | null): string | null {
  if (wsd === null) return null;
  if (wsd < 4) return "바람 약함";
  if (wsd < 9) return "바람 조금 강함";
  return "바람 강함";
}

/** 하드코딩 대신 실시간 부산 전체 평균 날씨를 보여주는 한 줄 요약 */
export default function TodayWeather() {
  const { data: weather, isPending } = useWeather();
  const summary = pickDistrictWeather(weather);

  if (isPending) {
    return <div className="mt-2 h-4 w-32 animate-shimmer rounded" />;
  }
  if (!summary || summary.tmp === null) return null;

  const wind = windLabel(summary.wsd);

  return (
    <p className="mt-2 flex items-center gap-1 text-xs text-gray-400">
      <span aria-hidden="true">{ptyEmojiMap[summary.pty]}</span>
      {ptyLabelMap[summary.pty]} {Math.round(summary.tmp)}°
      {wind && <> · {wind}</>}
    </p>
  );
}
