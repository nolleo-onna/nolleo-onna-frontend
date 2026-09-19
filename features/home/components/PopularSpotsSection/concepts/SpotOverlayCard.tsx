import Image from "next/image";
import { MapPin, Star } from "lucide-react";

import { formatPrice, type SpotCardProps } from "./types";

/**
 * 시안 B · 사진이 전부
 * 세로로 긴 사진 한 장이 카드 전체. 이름·지역·값을 사진 아래쪽 어두운 자리에 얹는다.
 * 배지는 "BUSAN" 대신 **지역 이름**을 달아 어디인지 바로 알게 했다.
 */
export default function SpotOverlayCard({
  imageSrc,
  name,
  location,
  rating,
  price,
  onClick,
}: SpotCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative block aspect-[3/4] w-full overflow-hidden rounded-[20px] bg-navy-900 text-left transition-transform duration-300 hover:-translate-y-1"
    >
      <Image
        src={imageSrc}
        alt={name}
        fill
        sizes="(max-width: 744px) 50vw, 25vw"
        className="object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-navy-900 via-navy-900/40 to-transparent" />

      {/* 위 — 지역 · 별점 */}
      <div className="absolute inset-x-3 top-3 flex items-center justify-between">
        <span className="inline-flex items-center gap-1 rounded-full bg-black/35 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
          <MapPin className="h-3 w-3" />
          {location}
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-black/35 px-2 py-1 text-[11px] font-bold text-white backdrop-blur-sm">
          <Star className="h-3 w-3 fill-amber-300 text-amber-300" />
          {rating.toFixed(1)}
        </span>
      </div>

      {/* 아래 — 이름 · 값 */}
      <div className="absolute inset-x-0 bottom-0 p-4">
        <p className="line-clamp-2 text-[16px] font-bold leading-snug text-white break-keep">{name}</p>
        <p className="mt-1.5 text-[12px] font-semibold text-lime-300">{formatPrice(price)}</p>
      </div>
    </button>
  );
}
