import Image from "next/image";
import { ChevronRight, Eye, Heart, MapPin } from "lucide-react";

import { formatCost } from "@/features/course/utils/format";
import { maskName } from "@/features/hankkut/utils/maskName";
import type { CourseCardProps } from "./types";

/**
 * 시안 A · 매거진 — 사진 한 장이 카드 전체. 제목·동선·작성자를 사진 위에 얹는다.
 * 흰 여백 없이 사진이 꽉 차서 격자로 깔았을 때 화보처럼 보인다.
 */
export default function CourseCardMagazine({
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
  const head = stops.slice(0, 2);
  const remaining = stops.length - head.length;

  return (
    <div className="group relative flex aspect-[4/5] w-full flex-col justify-end overflow-hidden rounded-[24px] bg-navy-900 text-white transition-transform duration-300 hover:-translate-y-1">
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
        <div className="absolute inset-0 bg-gradient-to-br from-ocean-500 via-ocean-700 to-navy-800" />
      )}
      {/* 글씨가 사진 위에서도 읽히게 아래쪽을 어둡게 */}
      <div className="absolute inset-0 bg-gradient-to-t from-navy-900 via-navy-900/55 to-transparent" />

      {/* 위 — 순위 · 장소 수 */}
      <div className="absolute inset-x-4 top-4 flex items-center gap-2">
        {rank !== undefined && (
          <span className="flex h-7 min-w-7 items-center justify-center rounded-full bg-lime-300 px-2 text-[12px] font-bold text-navy-900">
            {rank}
          </span>
        )}
        <span className="ml-auto flex items-center gap-1 rounded-full bg-black/35 px-2.5 py-1 text-[11px] font-semibold backdrop-blur-sm">
          <MapPin className="h-3 w-3" />
          {stops.length}곳
        </span>
      </div>

      {/* 아래 — 제목 · 동선 · 작성자 */}
      <div className="relative p-4 md:p-5">
        <h3 className="line-clamp-2 text-[19px] font-bold leading-snug tracking-tight break-keep">{title}</h3>

        <p className="mt-2 flex flex-wrap items-center gap-x-1 gap-y-0.5 text-[12px] text-white/70">
          {head.map((stop, i) => (
            <span key={`${stop}-${i}`} className="flex items-center gap-1">
              {i > 0 && <ChevronRight className="h-3 w-3 text-white/40" />}
              <span className="truncate">{stop}</span>
            </span>
          ))}
          {remaining > 0 && <span className="text-white/50">외 {remaining}곳</span>}
        </p>

        <div className="mt-3.5 flex items-center gap-3 border-t border-white/15 pt-3 text-[12px] text-white/70">
          <span className="min-w-0 truncate">{authorName}</span>
          <span className="ml-auto flex items-center gap-1">
            <Eye className="h-3.5 w-3.5" />
            {viewCount}
          </span>
          {likeCount > 0 && (
            <span className="flex items-center gap-1">
              <Heart className="h-3.5 w-3.5 text-pink-300" />
              {likeCount}
            </span>
          )}
          {totalCost !== null && totalCost > 0 && (
            <span className="rounded-full bg-white/15 px-2 py-0.5 font-bold text-white">
              {formatCost(totalCost)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
