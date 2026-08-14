"use client";

import { useRouter } from "next/navigation";
import { useCrowd } from "@/features/crowd/hooks/useCrowd";
import { getCrowdLevel, CROWD_STYLE } from "@/features/crowd/utils/crowdUtils";

export default function CrowdSection() {
  const router = useRouter();
  const { data, isPending } = useCrowd();

  const top4 = data?.slice(0, 4) ?? [];

  return (
    <section className="py-6 md:py-10">
      {/* 헤더 */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-ocean-600">오늘 붐빌 곳</span>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900">사람 많을 곳 미리 알기</h2>
          <p className="text-xs text-gray-400">관광공사 혼잡도 예측 · 오늘 기준</p>
        </div>
        <button
          onClick={() => router.push("/crowd")}
          className="text-sm text-gray-500 border border-gray-200 rounded-lg px-3 py-1.5"
        >
          전체보기
        </button>
      </div>

      {/* 카드 그리드 */}
      {isPending ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="aspect-[4/3] rounded-2xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {top4.map((spot, i) => {
            const level = getCrowdLevel(spot.rate);
            const style = CROWD_STYLE[level];
            return (
              <div
                key={`${spot.name}-${i}`}
                onClick={() => router.push("/crowd")}
                className="relative aspect-[4/3] rounded-2xl overflow-hidden cursor-pointer group bg-gray-200 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
              >
                {/* 순위 */}
                <span className="absolute top-3 left-3 z-10 w-6 h-6 flex items-center justify-center rounded-full bg-black/60 text-white text-xs font-bold">
                  {i + 1}
                </span>
                {/* 혼잡도 뱃지 */}
                <span
                  className="absolute top-3 right-3 z-10 px-2 py-0.5 rounded-full text-xs font-semibold"
                  style={{ backgroundColor: style.bg, color: style.text }}
                >
                  {style.label}
                </span>
                {/* 그라데이션 */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent z-[1]" />
                {/* 텍스트 */}
                <div className="absolute bottom-3 left-3 z-10">
                  <p className="text-white font-bold text-sm">{spot.name}</p>
                  <p className="text-white/70 text-xs">{spot.district} · 집중률 {spot.rate}%</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}