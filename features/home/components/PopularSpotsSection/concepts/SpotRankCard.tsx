import Image from "next/image";
import { Star } from "lucide-react";

import { formatPrice, type SpotCardProps } from "./types";

/**
 * 시안 C · 순위 매거진
 * 사진 위에 큰 순위 숫자를 얹어 "인기"라는 섹션 이름을 카드가 직접 말하게 한다.
 * 숫자는 사진 위 흰 글자 + 그림자라 사진을 가리지 않는다.
 */
export default function SpotRankCard({
  imageSrc,
  name,
  location,
  rating,
  price,
  index,
  onClick,
}: SpotCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group block w-full overflow-hidden rounded-[20px] bg-white text-left ring-1 ring-gray-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_36px_-16px_rgba(13,48,128,0.25)]"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        <Image
          src={imageSrc}
          alt={name}
          fill
          sizes="(max-width: 744px) 50vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <span aria-hidden className="absolute inset-0 bg-gradient-to-tr from-black/45 via-transparent to-transparent" />
        <span className="absolute bottom-1 left-3 text-[44px] leading-none font-black text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
          {index + 1}
        </span>
      </div>

      <div className="flex items-center gap-2 px-4 pb-3.5 pt-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-bold text-navy-900">{name}</p>
          <p className="mt-0.5 flex items-center gap-1.5 text-[12px] text-gray-400">
            <span className="truncate">{location}</span>
            <span className="shrink-0 text-gray-300">·</span>
            <span className="flex shrink-0 items-center gap-0.5 font-semibold text-gray-600">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              {rating.toFixed(1)}
            </span>
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-gray-50 px-2.5 py-1 text-[12px] font-bold text-navy-900">
          {formatPrice(price)}
        </span>
      </div>
    </button>
  );
}
