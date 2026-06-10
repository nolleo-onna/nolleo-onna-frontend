import CardBase from "@/components/ui/Card/CardBase";
import { ReactNode } from "react";
import { Star, MapPin } from "lucide-react";
import Image from "next/image";

type Variant = "default" | "overlay";

interface SpotCardProps {
  imageSrc: string;
  name: string;
  location: string;
  rating: number;
  reviewCount: string;
  price?: number | null;
  crowdStatus?: "매우혼잡" | "혼잡" | "보통" | "여유";
  onClick?: () => void;
  className?: string;
  topLeftSlot?: ReactNode;
  variant?: Variant;
}

const crowdColorMap: Record<string, string> = {
  매우혼잡: "bg-red-500",
  혼잡: "bg-red-400",
  보통: "bg-yellow-400",
  여유: "bg-green-400",
};

export default function SpotCard({
  imageSrc,
  name,
  location,
  rating,
  reviewCount,
  price,
  crowdStatus,
  onClick,
  className,
  topLeftSlot,
  variant = "default",
}: SpotCardProps) {
  const isFree = price === null;

  if (variant === "overlay") {
    return (
      <div
        onClick={onClick}
        className={`group relative overflow-hidden rounded-2xl aspect-[4/3] cursor-pointer ${className}`}
      >
        {/* 배경 이미지 */}
        <Image
          src={imageSrc}
          alt={name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 50vw, 25vw"
        />

        {/* 그라디언트 */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

        {/* 상단 좌측 (랭킹) */}
        {topLeftSlot && (
          <div className="absolute top-3 left-3">{topLeftSlot}</div>
        )}

        {/* 상단 우측 (혼잡도) */}
        {crowdStatus && (
          <div className="absolute top-3 right-3">
            <span className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold text-white ${crowdColorMap[crowdStatus]}`}>
              <span className="w-1.5 h-1.5 rounded-full bg-white" />
              {crowdStatus}
            </span>
          </div>
        )}

        {/* 하단 텍스트 */}
        <div className="absolute bottom-0 left-0 right-0 p-3 flex flex-col gap-0.5">
          <p className="text-sm font-bold text-white">{name}</p>
          <p className="text-xs text-white/70">{location}</p>
        </div>
      </div>
    );
  }

  return (
    <CardBase
      imageSrc={imageSrc}
      imageAlt={name}
      badges={crowdStatus ? [{ label: crowdStatus, variant: "crowd" }] : []}
      topRightSlot={
        isFree ? (
          <span className="rounded-full bg-navy-400 px-2.5 py-0.5 text-xs font-semibold text-white">
            무료
          </span>
        ) : undefined
      }
      onClick={onClick}
      className={className}
      topLeftSlot={topLeftSlot}
    >
      <div className="flex items-center gap-1">
        <Star className="w-3 h-3 fill-orange-400 text-orange-400" />
        <span className="text-xs font-semibold text-gray-800">{rating}</span>
        <span className="text-xs text-gray-400">({reviewCount})</span>
      </div>
      <p className="text-sm font-bold text-gray-900">{name}</p>
      <p className="flex items-center gap-0.5 text-xs text-gray-500">
        <MapPin className="w-3 h-3 text-gray-400" />
        {location}
      </p>
      <p className={`mt-1 text-sm font-bold ${isFree ? "text-navy-400" : "text-gray-900"}`}>
        {isFree ? "무료" : `${price?.toLocaleString()}원/인`}
      </p>
    </CardBase>
  );
}