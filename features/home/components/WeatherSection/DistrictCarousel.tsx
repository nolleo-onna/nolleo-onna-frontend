"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";

import type { DistrictSummary } from "@/features/home/utils/districtWeather";
import { ptyEmojiMap, ptyLabelMap } from "@/types/weather";

const WEEKDAY = ["일", "월", "화", "수", "목", "금", "토"];

function getTodayLabel() {
  const t = new Date();
  return `${t.getMonth() + 1}월 ${t.getDate()}일 ${WEEKDAY[t.getDay()]}요일`;
}

/**
 * 구별 요약을 3초마다 순환.
 * 헤더의 "오늘의 ~"는 고정, 지역명만 아래→위로 롤업 애니메이션.
 * 카드 3개는 위치 고정, 값만 갱신.
 */
export default function DistrictCarousel({
  districts,
}: {
  districts: DistrictSummary[];
}) {
  const [index, setIndex] = useState(0);
  const dateLabel = getTodayLabel();

  useEffect(() => {
    if (districts.length <= 1) return;
    const timer = setInterval(
      () => setIndex((i) => (i + 1) % districts.length),
      3000,
    );
    return () => clearInterval(timer);
  }, [districts.length]);

  if (districts.length === 0) return null;

  const summary = districts[index % districts.length];

  return (
    <div>
      {/* 헤더: "오늘의"는 고정, 지역명만 아래에서 위로 바뀜 */}
      <p className="text-xs text-gray-400 mb-4">
        오늘의{" "}
        <motion.span
          key={summary.district}
          initial={{ y: 5, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="inline-block align-baseline font-semibold text-gray-500"
        >
          {summary.district}
        </motion.span>{" "}
        · {dateLabel}
      </p>

      {/* 카드 3개 (위치 고정, 값만 갱신) */}
      <div className="grid grid-cols-3 gap-3">
        {/* 기온 */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-sky-400 to-blue-500 p-4 md:p-5 text-white">
          <div className="absolute -right-3 -top-3 text-6xl opacity-20 select-none">
            {ptyEmojiMap[summary.pty]}
          </div>
          <p className="text-xs font-medium opacity-70 mb-2">오늘 날씨</p>
          <p className="text-2xl md:text-3xl font-bold tracking-tight">
            {summary.tmp !== null ? `${summary.tmp}°` : "정보 없음"}
          </p>
          <p className="text-xs opacity-70 mt-1.5">{ptyLabelMap[summary.pty]}</p>
        </div>

        {/* 강수 */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 p-4 md:p-5 text-white">
          <div className="absolute -right-3 -top-3 text-6xl opacity-20 select-none">☔</div>
          <p className="text-xs font-medium opacity-70 mb-2">강수</p>
          <p className="text-2xl md:text-3xl font-bold tracking-tight">
            {ptyLabelMap[summary.pty]}
          </p>
          <p className="text-xs opacity-70 mt-1.5">
            {summary.rn1 !== null ? `강수량 ${summary.rn1}mm` : "강수량 정보 없음"}
          </p>
        </div>

        {/* 혼잡도 (집중률 소수점 반올림) */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-400 to-pink-500 p-4 md:p-5 text-white">
          <div className="absolute -right-3 -top-3 text-6xl opacity-20 select-none">🗺️</div>
          <p className="text-xs font-medium opacity-70 mb-2">관광지 혼잡</p>
          <p className="text-2xl md:text-3xl font-bold tracking-tight">
            {summary.congestionLevel ?? "정보 없음"}
          </p>
          <p className="text-xs opacity-70 mt-1.5">
            {summary.congestionRate !== null
              ? `집중률 ${Math.round(summary.congestionRate)}%`
              : "혼잡도 데이터 없음"}
          </p>
        </div>
      </div>
    </div>
  );
}
