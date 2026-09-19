import Image from "next/image";
import { Eye, Heart, Wallet } from "lucide-react";

import { formatCost } from "@/features/course/utils/format";
import { maskName } from "@/features/hankkut/utils/maskName";
import type { CourseCardProps } from "./types";

const MAX_DOTS = 4;

/**
 * 시안 C · 노선도 — 들르는 곳을 지하철 노선처럼 가로 한 줄에 번호 점으로 잇는다.
 * 세로로 쌓던 동선을 가로로 펴서 카드가 낮아지고, 순서가 한눈에 들어온다.
 */
export default function CourseCardRouteLine({
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
  const dots = stops.slice(0, MAX_DOTS);
  const remaining = stops.length - dots.length;

  return (
    <div className="group flex h-full w-full flex-col overflow-hidden rounded-[22px] bg-white ring-1 ring-gray-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_36px_-16px_rgba(13,48,128,0.25)]">
      <div className="relative aspect-[16/9] w-full overflow-hidden">
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
        {rank !== undefined && (
          <span className="absolute left-3 top-3 flex h-7 min-w-7 items-center justify-center rounded-full bg-navy-900/85 px-2 text-[12px] font-bold text-lime-300 backdrop-blur-sm">
            {rank}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col px-4 pb-4 pt-3.5">
        <h3 className="line-clamp-1 text-[17px] font-bold tracking-tight text-navy-900">{title}</h3>

        {/* 노선 — 점과 선을 잇고 이름은 점 아래에 */}
        <div className="mt-3.5 flex items-start">
          {dots.map((stop, i) => (
            <div key={`${stop}-${i}`} className="flex min-w-0 flex-1 flex-col items-center">
              <div className="flex w-full items-center">
                <span className={`h-px flex-1 ${i === 0 ? "bg-transparent" : "bg-ocean-200"}`} />
                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                    i === 0 ? "bg-ocean-500 text-white" : "bg-ocean-100 text-ocean-600"
                  }`}
                >
                  {i + 1}
                </span>
                <span
                  className={`h-px flex-1 ${i === dots.length - 1 && remaining === 0 ? "bg-transparent" : "bg-ocean-200"}`}
                />
              </div>
              <span className="mt-1.5 w-full truncate px-0.5 text-center text-[11px] text-gray-600">{stop}</span>
            </div>
          ))}
          {remaining > 0 && (
            <div className="flex shrink-0 flex-col items-center">
              <div className="flex items-center">
                <span className="h-px w-2 bg-ocean-200" />
                <span className="flex h-5 items-center rounded-full bg-gray-100 px-1.5 text-[10px] font-bold text-gray-500">
                  +{remaining}
                </span>
              </div>
              <span className="mt-1.5 text-[11px] text-gray-400">더</span>
            </div>
          )}
        </div>

        <div className="mt-auto flex items-center gap-3 border-t border-gray-50 pt-3 text-[12px] text-gray-500">
          <span className="min-w-0 truncate">{authorName}</span>
          <span className="ml-auto flex items-center gap-1 font-semibold text-gray-700">
            <Eye className="h-3.5 w-3.5 text-gray-400" />
            {viewCount}
          </span>
          {likeCount > 0 && (
            <span className="flex items-center gap-1">
              <Heart className="h-3.5 w-3.5 text-pink-400" />
              {likeCount}
            </span>
          )}
          {totalCost !== null && totalCost > 0 && (
            <span className="flex items-center gap-1 font-semibold text-navy-900">
              <Wallet className="h-3.5 w-3.5 text-gray-400" />
              {formatCost(totalCost)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
