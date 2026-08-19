"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, Flame, Leaf, X } from "lucide-react";

import { getCrowdLevel, CROWD_STYLE } from "@/features/crowd/utils/crowdUtils";
import type { CrowdSpot } from "@/types/crowd";

interface DistrictPanelProps {
  district: string;
  spots: CrowdSpot[];
  onClose: () => void;
}

function SpotRow({ spot, rank }: { spot: CrowdSpot; rank?: number }) {
  const level = getCrowdLevel(spot.rate);
  const style = CROWD_STYLE[level];

  return (
    <div className="flex items-center gap-2.5">
      {rank !== undefined && (
        <span
          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
            rank <= 3 ? "bg-navy-900 text-lime-300" : "bg-gray-100 text-gray-500"
          }`}
        >
          {rank}
        </span>
      )}
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center justify-between gap-2">
          <p className="truncate text-[13px] font-semibold text-gray-900">
            {spot.name}
          </p>
          <span
            className="shrink-0 rounded-full px-1.5 py-[1px] text-[10px] font-bold"
            style={{ backgroundColor: style.bg, color: style.text }}
          >
            {style.label}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="h-1.5 flex-1 overflow-hidden rounded-full"
            style={{ backgroundColor: `${style.bg}22` }}
          >
            <div
              className="h-full rounded-full"
              style={{
                width: `${Math.min(Math.max(spot.rate, 4), 100)}%`,
                backgroundColor: style.bg,
              }}
            />
          </div>
          <span className="shrink-0 text-[11px] tabular-nums text-gray-400">
            {Math.round(spot.rate)}%
          </span>
        </div>
      </div>
    </div>
  );
}

/** 지도에서 구를 클릭했을 때 지도 위에 뜨는 구 상세 패널 */
export default function DistrictPanel({ district, spots, onClose }: DistrictPanelProps) {
  const sorted = [...spots].sort((a, b) => b.rate - a.rate);
  const busiest = sorted.slice(0, 5);
  const relaxed = [...sorted].reverse().filter((s) => getCrowdLevel(s.rate) === "여유").slice(0, 3);

  const avgRate =
    spots.length > 0
      ? Math.round(spots.reduce((sum, s) => sum + s.rate, 0) / spots.length)
      : 0;
  const avgLevel = getCrowdLevel(avgRate);
  const avgStyle = CROWD_STYLE[avgLevel];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="pointer-events-auto flex max-h-full w-full flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-[0_16px_48px_rgba(13,48,128,0.18)]"
    >
      {/* 헤더 */}
      <div className="relative shrink-0 bg-gradient-to-br from-ocean-50 via-white to-lime-50 px-5 pb-4 pt-5">
        <button
          type="button"
          onClick={onClose}
          aria-label="패널 닫기"
          className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-white hover:text-gray-700"
        >
          <X className="h-4 w-4" />
        </button>
        <p className="text-[11px] font-semibold text-ocean-600">지금 이 지역은</p>
        <div className="mt-0.5 flex items-center gap-2">
          <h2 className="text-lg font-bold text-navy-900">{district}</h2>
          <span
            className="rounded-full px-2 py-0.5 text-[11px] font-bold"
            style={{ backgroundColor: avgStyle.bg, color: avgStyle.text }}
          >
            평균 {avgLevel} · {avgRate}%
          </span>
        </div>
      </div>

      {/* 본문 */}
      <div className="flex-1 overflow-y-auto px-5 py-4">
        {busiest.length === 0 ? (
          <p className="py-6 text-center text-sm text-gray-400">
            이 지역의 혼잡도 데이터가 아직 없어요
          </p>
        ) : (
          <>
            <p className="mb-3 flex items-center gap-1 text-[12px] font-bold text-gray-900">
              <Flame className="h-3.5 w-3.5 text-red-500" />
              지금 붐비는 곳 TOP {busiest.length}
            </p>
            <div className="flex flex-col gap-3">
              {busiest.map((spot, i) => (
                <SpotRow key={spot.name} spot={spot} rank={i + 1} />
              ))}
            </div>

            {relaxed.length > 0 && (
              <>
                <p className="mt-5 mb-3 flex items-center gap-1 border-t border-gray-50 pt-4 text-[12px] font-bold text-gray-900">
                  <Leaf className="h-3.5 w-3.5 text-lime-600" />
                  대신 여기는 여유로워요
                </p>
                <div className="flex flex-col gap-3">
                  {relaxed.map((spot) => (
                    <SpotRow key={spot.name} spot={spot} />
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>

      {/* 푸터 */}
      <Link
        href={`/spot?region=${encodeURIComponent(district)}`}
        className="flex shrink-0 items-center justify-center gap-1 border-t border-gray-100 bg-gray-50/60 py-3 text-[13px] font-semibold text-ocean-600 transition-colors hover:bg-ocean-50"
      >
        {district} 스팟 보러가기
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </motion.div>
  );
}
