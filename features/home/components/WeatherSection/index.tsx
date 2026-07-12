"use client";

import DistrictCarousel from "./DistrictCarousel";
import { useCongestion } from "@/features/home/hooks/useCongestion";
import { useWeather } from "@/features/home/hooks/useWeather";
import { mergeDistrictSummaries } from "@/features/home/utils/districtWeather";

export default function WeatherSection() {
  // district 미지정 → 부산 전체 구 목록을 받아 구별로 캐러셀 렌더
  const { data: weather } = useWeather();
  const { data: congestion } = useCongestion();

  const districts = mergeDistrictSummaries(weather, congestion);

  return (
    <section className="py-6 md:py-10">
      {districts.length === 0 ? (
        // 로딩 스켈레톤
        <>
          <div className="h-4 w-40 rounded bg-gray-100 animate-pulse mb-4" />
          <div className="grid grid-cols-3 gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-28 rounded-2xl bg-gray-100 animate-pulse" />
            ))}
          </div>
        </>
      ) : (
        <DistrictCarousel districts={districts} />
      )}
    </section>
  );
}
