"use client";

import { useSearchParams } from "next/navigation";
import { Wind } from "lucide-react";

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
 * 사이드바 맨 위 오늘 날씨 카드.
 * 예전엔 제목 아래 회색 한 줄이라 눈에 걸리지 않았다 — 온도를 크게 세워 "오늘 어떤 날인지"를 먼저 읽히게 한다.
 * 지역 필터(?region=동래구)가 있으면 그 구의 날씨를, 없으면 부산 전체 평균을 보여준다.
 */
export default function TodayWeatherCard() {
  const region = useSearchParams().get("region");
  const { data: weather, isPending } = useWeather();
  const summary = pickDistrictWeather(weather, region ?? undefined);

  if (isPending) return <div className="animate-shimmer h-[92px] rounded-2xl" />;
  if (!summary || summary.tmp === null) return null;

  const wind = windLabel(summary.wsd);

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-ocean-500 via-ocean-600 to-navy-600 px-4 py-3.5 text-white">
      <span aria-hidden className="pointer-events-none absolute -right-6 -top-8 h-24 w-24 rounded-full bg-white/15 blur-2xl" />

      <p className="relative text-[11px] font-semibold text-white/70">
        {region ? `${summary.district} 지금` : "부산 지금"}
      </p>

      <div className="relative mt-1 flex items-end gap-2">
        <span className="text-[32px] leading-none font-bold tracking-tight">{Math.round(summary.tmp)}°</span>
        <span className="mb-0.5 flex items-center gap-1 text-[13px] font-semibold text-white/90">
          <span aria-hidden>{ptyEmojiMap[summary.pty]}</span>
          {ptyLabelMap[summary.pty]}
        </span>
      </div>

      {wind && (
        <p className="relative mt-1.5 flex items-center gap-1 text-[11px] text-white/70">
          <Wind className="h-3 w-3" />
          {wind}
        </p>
      )}
    </div>
  );
}
