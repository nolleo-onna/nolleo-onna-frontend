"use client";

import { useWeather } from "@/features/home/hooks/useWeather";
import { pickDistrictWeather } from "@/features/home/utils/weatherUtils";
import { ptyEmojiMap, ptyLabelMap, WeatherData } from "@/types/weather";

// 미세먼지/혼잡도는 아직 전용 API가 없어 임시 데이터 사용 (props로 덮어쓰기 가능)
const mockDust: WeatherData["dust"] = { grade: "좋음", pm: 23, recommendation: "야외활동 적합" };
const mockCrowd: WeatherData["crowd"] = { grade: "약간혼잡", description: "주말 · 오후 피크 예상" };

const WEEKDAY = ["일", "월", "화", "수", "목", "금", "토"];

function getTodayLabel() {
  const today = new Date();
  return `${today.getMonth() + 1}월 ${today.getDate()}일 ${WEEKDAY[today.getDay()]}요일`;
}

type Props = {
  district?: string; // 없으면 부산 전체 기준
  dust?: WeatherData["dust"];
  crowd?: WeatherData["crowd"];
};

export default function WeatherSection({ district, dust = mockDust, crowd = mockCrowd }: Props) {
  const { data, isPending, isError } = useWeather(district);
  const weather = pickDistrictWeather(data, district);

  return (
    <section className="py-6 md:py-10">
      <p className="text-xs text-gray-400 mb-4">오늘의 부산 · {getTodayLabel()}</p>

      <div className="grid grid-cols-3 gap-3">
        {/* 날씨 */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-sky-400 to-blue-500 p-4 md:p-5 text-white">
          <div className="absolute -right-3 -top-3 text-6xl opacity-20 select-none">
            {weather ? ptyEmojiMap[weather.pty] : "☀️"}
          </div>
          <p className="text-xs font-medium opacity-70 mb-2">오늘 날씨</p>

          {isPending ? (
            <div className="h-8 w-16 rounded bg-white/30 animate-pulse" />
          ) : isError || !weather ? (
            <p className="text-sm opacity-80 mt-1">날씨 정보를 불러오지 못했어요</p>
          ) : (
            <>
              <p className="text-2xl md:text-3xl font-bold tracking-tight">
                {weather.tmp !== null ? `${weather.tmp}°` : "정보 없음"}
              </p>
              <p className="text-xs opacity-70 mt-1.5">
                {ptyLabelMap[weather.pty]}
                {weather.reh !== null && ` · 습도 ${weather.reh}%`}
                {weather.wsd !== null && ` · 풍속 ${weather.wsd}m/s`}
              </p>
            </>
          )}
        </div>

        {/* 미세먼지 */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 p-4 md:p-5 text-white">
          <div className="absolute -right-3 -top-3 text-6xl opacity-20 select-none">🌿</div>
          <p className="text-xs font-medium opacity-70 mb-2">미세먼지</p>
          <p className="text-2xl md:text-3xl font-bold tracking-tight">
            {dust.grade}
            <span className="text-sm font-normal opacity-70 ml-2">PM {dust.pm}</span>
          </p>
          <p className="text-xs opacity-70 mt-1.5">{dust.recommendation}</p>
        </div>

        {/* 혼잡도 */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-400 to-pink-500 p-4 md:p-5 text-white">
          <div className="absolute -right-3 -top-3 text-6xl opacity-20 select-none">🗺️</div>
          <p className="text-xs font-medium opacity-70 mb-2">관광지 혼잡</p>
          <p className="text-2xl md:text-3xl font-bold tracking-tight">{crowd.grade}</p>
          <p className="text-xs opacity-70 mt-1.5">{crowd.description}</p>
        </div>
      </div>
    </section>
  );
}
