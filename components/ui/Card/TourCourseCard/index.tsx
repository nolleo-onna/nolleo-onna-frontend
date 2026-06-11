import Image from "next/image";
import { Star, MapPin } from "lucide-react";

interface TourCourseCardProps {
  imageSrc: string;
  title: string;
  rating: number;
  reviewCount: string;
  location: string;
  regionTags?: string[];
  onClick?: () => void;
  className?: string;
}

export default function TourCourseCard({
  imageSrc,
  title,
  rating,
  reviewCount,
  location,
  regionTags = [],
  onClick,
  className = "",
}: TourCourseCardProps) {
  return (
    <div
      onClick={onClick}
      className={`group overflow-hidden rounded-2xl bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl cursor-pointer ${className}`}
    >
      {/* 이미지 */}
      <div className="relative w-full aspect-video overflow-hidden">
        <Image
          src={imageSrc}
          alt={title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
        {/* 뱃지 */}
        <div className="absolute top-3 left-3 flex gap-1.5">
          <span className="rounded-full bg-pink-400 px-2.5 py-0.5 text-xs font-semibold text-white">
            관광공사
          </span>
          {regionTags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-white/90 px-2.5 py-0.5 text-xs font-semibold text-gray-700"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* 하단 정보 */}
      <div className="p-4 flex flex-col gap-2">
        <p className="text-sm font-bold text-gray-900 line-clamp-2">{title}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 fill-orange-400 text-orange-400" />
            <span className="text-xs font-semibold text-gray-800">{rating}</span>
            <span className="text-xs text-gray-400">({reviewCount})</span>
          </div>
          <p className="flex items-center gap-0.5 text-xs text-gray-500">
            <MapPin className="w-3 h-3 text-gray-400" />
            {location}
          </p>
        </div>
      </div>
    </div>
  );
}