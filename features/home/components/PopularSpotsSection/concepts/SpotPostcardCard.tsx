import Image from "next/image";
import { Star } from "lucide-react";

import { formatPrice, type SpotCardProps } from "./types";

/**
 * 시안 A · 엽서
 * 사진 위에 아무것도 얹지 않고, 아래 흰 여백에 이름·지역·값만 담담하게 적는다.
 * "BUSAN" 배지 대신 지역 이름이 그 자리를 대신한다 — 어차피 다 부산이라 배지는 정보가 아니었다.
 */
export default function SpotPostcardCard({
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
      className="group block w-full overflow-hidden rounded-[20px] bg-white text-left ring-1 ring-gray-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_36px_-16px_rgba(13,48,128,0.25)]"
    >
      <div className="relative aspect-[5/4] w-full overflow-hidden">
        <Image
          src={imageSrc}
          alt={name}
          fill
          sizes="(max-width: 744px) 50vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>

      <div className="px-4 pb-4 pt-3">
        <p className="truncate text-[15px] font-bold text-navy-900">{name}</p>
        <p className="mt-1 truncate text-[12px] text-gray-400">{location}</p>

        <div className="mt-3 flex items-center justify-between border-t border-gray-50 pt-2.5">
          <span className="flex items-center gap-1 text-[12px] font-semibold text-gray-700">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            {rating.toFixed(1)}
          </span>
          <span className="text-[12px] font-bold text-navy-900">{formatPrice(price)}</span>
        </div>
      </div>
    </button>
  );
}
