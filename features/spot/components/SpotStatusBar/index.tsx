"use client";

import Link from "next/link";
import { useWeather } from "@/features/home/hooks/useWeather";
import { useCrowd } from "@/features/crowd/hooks/useCrowd";
import { getCrowdLevel } from "@/features/crowd/utils/crowdUtils";
import { ptyEmojiMap } from "@/types/weather";

// 설문 피드백 — "날씨랑 붐빌곳 여유로운 곳 안나와요"를 반영해 스팟 페이지 상단에
// 압축된 요약 바를 추가한다. 상세 혼잡도 지도는 /crowd로 링크.
export default function SpotStatusBar() {
  const { data: weather } = useWeather();
  const { data: crowd } = useCrowd();

  const temps = (weather ?? [])
    .map((w) => w.tmp)
    .filter((t): t is number => t !== null);
  const avgTemp =
    temps.length > 0 ? Math.round(temps.reduce((a, b) => a + b, 0) / temps.length) : null;
  const pty = weather?.[0]?.pty ?? 0;

  const busiest = (crowd ?? []).slice(0, 3);
  const relaxed = (crowd ?? []).filter((s) => getCrowdLevel(s.rate) === "여유").slice(0, 3);

  if (avgTemp === null && busiest.length === 0 && relaxed.length === 0) return null;

  return (
    <div className="flex shrink-0 items-center gap-4 overflow-x-auto border-b border-gray-100 bg-white px-5 py-2.5 scrollbar-hide">
      {avgTemp !== null && (
        <span className="flex shrink-0 items-center gap-1 text-sm font-semibold text-gray-800">
          <span aria-hidden="true">{ptyEmojiMap[pty]}</span>
          {avgTemp}°C
        </span>
      )}
      {busiest.length > 0 && (
        <div className="flex shrink-0 items-center gap-1.5">
          <span className="text-xs text-gray-400">지금 붐빔</span>
          {busiest.map((s) => (
            <span
              key={s.name}
              className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-500"
            >
              {s.name}
            </span>
          ))}
        </div>
      )}
      {relaxed.length > 0 && (
        <div className="flex shrink-0 items-center gap-1.5">
          <span className="text-xs text-gray-400">여유로운 곳</span>
          {relaxed.map((s) => (
            <span
              key={s.name}
              className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-600"
            >
              {s.name}
            </span>
          ))}
        </div>
      )}
      <Link
        href="/crowd"
        className="ml-auto shrink-0 whitespace-nowrap text-xs font-semibold text-ocean-600 hover:text-ocean-700"
      >
        혼잡도 지도 보기 →
      </Link>
    </div>
  );
}
