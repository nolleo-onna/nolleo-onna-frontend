"use client";

import { useEffect } from "react";
import { X, MapPin, Star } from "lucide-react";
import Image from "next/image";
import type { CoursePlace } from "@/features/course/data/mockCourse";

type Props = {
  place: CoursePlace | null;
  onClose: () => void;
};

const CATEGORY_COLOR: Record<CoursePlace["category"], string> = {
  관광명소: "bg-blue-100 text-blue-600",
  음식점: "bg-orange-100 text-orange-600",
  카페: "bg-yellow-100 text-yellow-600",
  쇼핑: "bg-purple-100 text-purple-600",
  "술집/바": "bg-pink-100 text-pink-600",
};

export default function CoursePlaceModal({ place, onClose }: Props) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!place) return null;

  return (
    <>
      {/* 백드롭 */}
      <div
        className="fixed inset-0 bg-black/40 z-40"
        onClick={onClose}
      />

      {/* 모달 */}
      <div
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50
                      w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-label={place.name}
      >
        {/* 이미지 */}
        <div className="relative h-52">
          <Image
            src={place.imageUrl}
            alt={place.name}
            fill
            className="object-cover"
          />
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center
                       rounded-full bg-black/50 text-white hover:bg-black/70 transition"
          >
            <X className="w-4 h-4" />
          </button>
          {/* 카테고리 뱃지 */}
          <span className={`absolute bottom-3 left-3 px-2 py-1 rounded-full text-xs font-medium
                            ${CATEGORY_COLOR[place.category]}`}>
            {place.category}
          </span>
        </div>

        {/* 본문 */}
        <div className="p-5 flex flex-col gap-3">
          <h2 className="text-xl font-bold text-gray-900">{place.name}</h2>

          {/* 별점 */}
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-semibold text-gray-800">{place.rating}</span>
            <span className="text-xs text-gray-400">({place.reviewCount.toLocaleString()})</span>
          </div>

          {/* 설명 */}
          <p className="text-sm text-gray-600 leading-relaxed">
            {place.description}
          </p>
        </div>
      </div>
    </>
  );
}
