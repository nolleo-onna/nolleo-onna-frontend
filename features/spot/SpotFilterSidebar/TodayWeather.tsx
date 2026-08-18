"use client";

import { useSearchParams } from "next/navigation";

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

/**
 * 실시간 날씨 한 줄 요약.
 * 지역 필터(?region=동래구)가 선택돼 있으면 그 구의 날씨를, 아니면 부산 전체 평균을 보여준다.
 */
export default function TodayWeather() {
  const region = useSearchParams().get("region");
  const { data: weather, isPending } = useWeather();
  const summary = pickDistrictWeather(weather, region ?? undefined);

  if (isPending) {
    return <div className="mt-2 h-4 w-32 animate-shimmer rounded" />;
  }
  if (!summary || summary.tmp === null) return null;

  const wind = windLabel(summary.wsd);

  return (
    <p className="mt-2 flex items-center gap-1 text-xs text-gray-400">
      {region && (
        <span className="font-semibold text-navy-400">{summary.district}</span>
      )}
      <span aria-hidden="true">{ptyEmojiMap[summary.pty]}</span>
      {ptyLabelMap[summary.pty]} {Math.round(summary.tmp)}°
      {wind && <> · {wind}</>}
    </p>
  );
}
