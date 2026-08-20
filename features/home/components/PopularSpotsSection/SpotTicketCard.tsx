import Image from "next/image";
import { MapPin, Star } from "lucide-react";

interface SpotTicketCardProps {
  imageSrc: string;
  name: string;
  location: string;
  rating: number;
  price?: number | null;
  /** 카드 순번 — 티켓 번호 자리에 쓴다 */
  index: number;
  onClick?: () => void;
}

// 부산 스팟을 하나씩 소개하는 "탑승권(보딩패스)" 컨셉 카드. 사이트 다른 곳의
// 이미지-오버레이형 카드와 다른 톤을 주려고 티켓 특유의 절취선+펀칭 노치를
// 그대로 가져왔다. 노치 색은 페이지 배경(bg-gray-50)과 맞춰야 "뚫린" 것처럼
// 보이므로, 이 카드를 다른 배경 위에 놓을 땐 노치 색도 같이 바꿔야 한다.
export default function SpotTicketCard({
  imageSrc,
  name,
  location,
  rating,
  price,
  index,
  onClick,
}: SpotTicketCardProps) {
  const isFree = price === null || price === undefined;

  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative block w-full overflow-hidden rounded-2xl bg-white text-left shadow-[0_1px_2px_rgba(0,0,0,0.04)] ring-1 ring-gray-100 transition-all duration-300 ease-out hover:-translate-y-1 hover:rotate-[-0.5deg] hover:shadow-[0_16px_32px_-12px_rgba(13,48,128,0.22)]"
    >
      {/* 사진 — 탑승권 상단의 목적지 사진 */}
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        <Image
          src={imageSrc}
          alt={name}
          fill
          sizes="(max-width: 744px) 50vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <span className="absolute left-2.5 top-2.5 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-bold tracking-wide text-navy-900 backdrop-blur-sm">
          BUSAN
        </span>
      </div>

      {/* 절취선 — 좌우에 펀칭 노치를 뚫어 티켓 스텁처럼 보이게 함 */}
      <div className="relative">
        <div className="border-t border-dashed border-gray-200" />
        <span className="absolute left-0 top-0 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gray-50" />
        <span className="absolute right-0 top-0 h-4 w-4 -translate-y-1/2 translate-x-1/2 rounded-full bg-gray-50" />
      </div>

      {/* 스텁 — 목적지 정보 */}
      <div className="px-3.5 pb-3 pt-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
            spot
          </span>
          <span className="flex items-center gap-0.5 text-[11px] font-bold text-amber-500">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            {rating.toFixed(1)}
          </span>
        </div>
        <p className="mt-1 truncate text-[15px] font-bold text-gray-900">{name}</p>
        <p className="mt-0.5 flex items-center gap-1 text-xs text-gray-400">
          <MapPin className="h-3 w-3 shrink-0" />
          <span className="truncate">{location}</span>
        </p>

        <div className="mt-2.5 flex items-center justify-between border-t border-dashed border-gray-100 pt-2">
          <span className="font-mono text-[10px] tracking-wider text-gray-300">
            NO.{String(index + 1).padStart(3, "0")}
          </span>
          <span
            className={`font-mono text-xs font-bold ${isFree ? "text-navy-400" : "text-gray-800"}`}
          >
            {isFree ? "FREE" : `${price.toLocaleString()}원`}
          </span>
        </div>
      </div>
    </button>
  );
}
