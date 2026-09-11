import Image from "next/image";
import { Eye, Heart, Wallet } from "lucide-react";

import AuthorAvatar from "@/features/hankkut/components/AuthorAvatar";
import { maskName } from "@/features/hankkut/utils/maskName";
import { formatCost } from "@/features/course/utils/format";

interface RouteItineraryCardProps {
  /** 조회수 순위 (1부터) */
  rank: number;
  imageSrc: string | null;
  title: string;
  authorNickname: string | null;
  authorProfileImageUrl: string | null;
  viewCount: number;
  likeCount: number;
  totalCost: number | null;
  /** 코스에 포함된 방문지 이름 순서대로 */
  stops: string[];
}

const MAX_VISIBLE_STOPS = 3;

// 인기 코스 카드. "코스=여러 곳을 잇는 동선"이라는 특징을 살려 방문지를 점선
// 타임라인으로 미리 보여주는 여정형 카드. 순위 배지와 조회수가 "인기"의 근거다.
export default function RouteItineraryCard({
  rank,
  imageSrc,
  title,
  authorNickname,
  authorProfileImageUrl,
  viewCount,
  likeCount,
  totalCost,
  stops,
}: RouteItineraryCardProps) {
  const visibleStops = stops.slice(0, MAX_VISIBLE_STOPS);
  const remaining = stops.length - visibleStops.length;
  const authorName = authorNickname ? maskName(authorNickname) : "놀러온나 여행자";

  return (
    <div className="group overflow-hidden rounded-[20px] bg-white ring-1 ring-gray-100 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_16px_32px_-14px_rgba(13,48,128,0.2)]">
      {/* 대표 사진 — 첫 스팟 이미지, 없으면 그라데이션 */}
      <div className="relative aspect-[16/9] w-full overflow-hidden">
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={title}
            fill
            quality={90}
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-ocean-100 via-white to-lime-100" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/5 to-transparent" />
        <span className="absolute left-3 top-3 flex h-7 min-w-7 items-center justify-center rounded-full bg-navy-900/85 px-2 text-[12px] font-bold text-lime-300 backdrop-blur-sm">
          {rank}
        </span>
        <p className="absolute inset-x-3 bottom-3 line-clamp-1 text-base font-bold text-white">
          {title}
        </p>
      </div>

      {/* 방문 동선 타임라인 */}
      <div className="px-4 pt-3.5">
        {visibleStops.map((stop, index) => (
          <div key={`${stop}-${index}`} className="flex items-stretch gap-2.5">
            <div className="flex flex-col items-center">
              <span
                className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                  index === 0 ? "bg-ocean-500" : "bg-gray-300"
                }`}
              />
              {index < visibleStops.length - 1 && (
                <span className="my-0.5 w-px flex-1 border-l border-dashed border-gray-200" />
              )}
            </div>
            <span className="truncate pb-2 text-xs text-gray-600">{stop}</span>
          </div>
        ))}
        {remaining > 0 && (
          <p className="ml-4 text-[11px] font-medium text-gray-400">+{remaining}곳 더 둘러보기</p>
        )}
      </div>

      {/* 하단 메타 — 작성자 · 조회수(인기 기준) · 좋아요 · 예상 비용 */}
      <div className="mt-1 flex items-center gap-3 border-t border-gray-50 px-4 py-3 text-xs text-gray-500">
        <span className="flex min-w-0 items-center gap-1.5">
          <AuthorAvatar name={authorName} imageUrl={authorProfileImageUrl ?? undefined} size={18} />
          <span className="truncate">{authorName}</span>
        </span>
        <span className="ml-auto flex items-center gap-1 font-semibold text-gray-700">
          <Eye className="h-3 w-3 text-gray-400" />
          {viewCount}
        </span>
        {likeCount > 0 && (
          <span className="flex items-center gap-1">
            <Heart className="h-3 w-3 text-pink-400" />
            {likeCount}
          </span>
        )}
        {totalCost !== null && totalCost > 0 && (
          <span className="flex items-center gap-1">
            <Wallet className="h-3 w-3 text-gray-400" />
            {formatCost(totalCost)}
          </span>
        )}
      </div>
    </div>
  );
}
