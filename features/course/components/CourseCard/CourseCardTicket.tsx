import Image from "next/image";
import { Eye, Heart } from "lucide-react";

import { formatCost } from "@/features/course/utils/format";
import { maskName } from "@/features/hankkut/utils/maskName";
import type { CourseCardProps } from "./types";

const MAX_CHIPS = 3;

/**
 * 시안 B · 코스 티켓 — 사진 아래로 점선을 그어 표(票) 모양으로. 아래쪽 반은 들르는 곳 칩과 값.
 * "이 코스를 끊어 간다"는 느낌이고, 예상 비용이 가장 크게 읽힌다.
 */
export default function CourseCardTicket({
  rank,
  imageSrc,
  title,
  authorNickname,
  viewCount,
  likeCount,
  totalCost,
  stops,
}: CourseCardProps) {
  const authorName = authorNickname ? maskName(authorNickname) : "놀러온나 여행자";
  const chips = stops.slice(0, MAX_CHIPS);
  const remaining = stops.length - chips.length;

  return (
    <div className="group flex h-full w-full flex-col overflow-hidden rounded-[22px] bg-white ring-1 ring-gray-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_36px_-16px_rgba(13,48,128,0.25)]">
      <div className="relative aspect-[16/10] w-full overflow-hidden">
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt=""
            fill
            quality={90}
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-ocean-100 via-white to-lime-100" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
        {rank !== undefined && (
          <span className="absolute left-3 top-3 flex h-7 min-w-7 items-center justify-center rounded-full bg-lime-300 px-2 text-[12px] font-bold text-navy-900">
            {rank}
          </span>
        )}
        <span className="absolute right-3 top-3 rounded-full bg-black/40 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
          {stops.length}곳
        </span>
        <p className="absolute inset-x-4 bottom-3 line-clamp-2 text-[17px] font-bold leading-snug text-white break-keep">
          {title}
        </p>
      </div>

      {/* 표를 뜯는 자리 — 양옆 반원과 점선 */}
      <div className="relative h-4">
        <span aria-hidden className="absolute -left-2 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-gray-50 ring-1 ring-gray-100" />
        <span aria-hidden className="absolute -right-2 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-gray-50 ring-1 ring-gray-100" />
        <span aria-hidden className="absolute inset-x-5 top-1/2 border-t border-dashed border-gray-200" />
      </div>

      <div className="flex flex-1 flex-col px-4 pb-4">
        <div className="flex flex-wrap gap-1.5">
          {chips.map((stop, i) => (
            <span
              key={`${stop}-${i}`}
              className="max-w-full truncate rounded-full bg-gray-100 px-2.5 py-1 text-[12px] font-medium text-gray-700"
            >
              {stop}
            </span>
          ))}
          {remaining > 0 && (
            <span className="rounded-full px-1.5 py-1 text-[12px] font-medium text-gray-400">+{remaining}</span>
          )}
        </div>

        <div className="mt-auto flex items-end justify-between gap-3 pt-4">
          <div className="min-w-0">
            <p className="truncate text-[12px] text-gray-400">{authorName}</p>
            <p className="mt-0.5 text-[20px] font-bold leading-none tracking-tight text-navy-900">
              {totalCost !== null && totalCost > 0 ? (
                <>
                  <span className="mr-1 text-[11px] font-semibold text-gray-400">예상</span>
                  {formatCost(totalCost)}
                </>
              ) : (
                <span className="text-[15px] text-gray-400">비용 정보 없음</span>
              )}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2.5 text-[12px] text-gray-500">
            <span className="flex items-center gap-1">
              <Eye className="h-3.5 w-3.5 text-gray-400" />
              {viewCount}
            </span>
            {likeCount > 0 && (
              <span className="flex items-center gap-1">
                <Heart className="h-3.5 w-3.5 text-pink-400" />
                {likeCount}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
