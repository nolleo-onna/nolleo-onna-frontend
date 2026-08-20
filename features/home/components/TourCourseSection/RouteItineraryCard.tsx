import Image from "next/image";
import { BadgeCheck, MapPin, Star } from "lucide-react";

interface RouteItineraryCardProps {
  imageSrc: string;
  title: string;
  rating: number;
  reviewCount: string;
  location: string;
  /** 코스에 포함된 방문지 이름 순서대로 */
  stops: string[];
}

const MAX_VISIBLE_STOPS = 3;

// 관광공사 추천 코스 전용 카드. 인기 부산 스팟(보딩패스)이나 한끗 갤러리
// (이미지 오버레이)와도 다른 톤을 주려고, "코스=여러 곳을 잇는 동선"이라는
// 특징을 살려 방문지를 점선 타임라인으로 미리 보여주는 여정형 카드로 만들었다.
export default function RouteItineraryCard({
  imageSrc,
  title,
  rating,
  reviewCount,
  location,
  stops,
}: RouteItineraryCardProps) {
  const visibleStops = stops.slice(0, MAX_VISIBLE_STOPS);
  const remaining = stops.length - visibleStops.length;

  return (
    <div className="group overflow-hidden rounded-[20px] bg-white ring-1 ring-gray-100 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_16px_32px_-14px_rgba(13,48,128,0.2)]">
      {/* 대표 사진 */}
      <div className="relative aspect-[16/9] w-full overflow-hidden">
        <Image
          src={imageSrc}
          alt={title}
          fill
          quality={90}
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/5 to-transparent" />
        <span className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-navy-900/85 px-2.5 py-1 text-[11px] font-bold text-lime-300 backdrop-blur-sm">
          <BadgeCheck className="h-3 w-3" />
          관광공사 인증
        </span>
        <p className="absolute inset-x-3 bottom-3 line-clamp-1 text-base font-bold text-white">
          {title}
        </p>
      </div>

      {/* 방문 동선 타임라인 — 코스가 여러 곳을 잇는다는 걸 한눈에 보여준다 */}
      <div className="px-4 pt-3.5">
        {visibleStops.map((stop, index) => (
          <div key={stop} className="flex items-stretch gap-2.5">
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
          <p className="ml-4 text-[11px] font-medium text-gray-400">
            +{remaining}곳 더 둘러보기
          </p>
        )}
      </div>

      {/* 하단 메타 정보 */}
      <div className="mt-1 flex items-center justify-between border-t border-gray-50 px-4 py-3">
        <span className="flex items-center gap-1 text-xs text-gray-500">
          <MapPin className="h-3 w-3 text-gray-400" />
          {location}
        </span>
        <span className="flex items-center gap-1 text-xs font-semibold text-gray-800">
          <Star className="h-3 w-3 fill-orange-400 text-orange-400" />
          {rating}
          <span className="font-normal text-gray-400">({reviewCount})</span>
        </span>
      </div>
    </div>
  );
}
