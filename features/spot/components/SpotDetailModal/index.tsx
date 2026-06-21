"use client";

import { useEffect } from "react";
import { X, MapPin, Phone, Clock, ParkingSquare, ExternalLink } from "lucide-react";
import { useSpotDetail } from "@/features/spot/hooks/useSpotDetail";

type Props = {
  contentId: string | null;
  onClose: () => void;
};

const extractUrl = (homepage: string) => {
  const match = homepage.match(/href=["']([^"']+)["']/);
  return match ? match[1] : homepage;
};

export default function SpotDetailModal({ contentId, onClose }: Props) {
  const { data, isPending } = useSpotDetail(contentId);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!contentId) return null;

  return (
    <>
      {/* 백드롭 */}
      <div
        className="fixed inset-0 bg-black/40 z-40"
        onClick={onClose}
      />

      {/* 모달 */}
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50
                      w-full max-w-lg max-h-[80vh] overflow-y-auto
                      bg-white rounded-2xl shadow-xl">

        {isPending ? (
          <div className="flex items-center justify-center h-60">
            <span className="text-sm text-gray-400">불러오는 중...</span>
          </div>
        ) : data ? (
          <>
            {/* 이미지 */}
            <div className="relative h-56 bg-gray-100">
              {data.firstImage ? (
                <img
                  src={data.firstImage}
                  alt={data.title}
                  className="w-full h-full object-cover rounded-t-2xl"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300 text-sm">
                  이미지 없음
                </div>
              )}
              <button
                onClick={onClose}
                className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center
                           rounded-full bg-black/50 text-white hover:bg-black/70 transition"
              >
                <X className="w-4 h-4" />
              </button>
              {data.lclsSystm2 && (
                <span className="absolute bottom-3 left-3 px-2 py-1 rounded-full
                                 bg-black/50 text-white text-xs">
                  {data.lclsSystm2}
                </span>
              )}
            </div>

            {/* 본문 */}
            <div className="p-5 flex flex-col gap-4">
              <h2 className="text-xl font-bold text-gray-900">{data.title}</h2>

              {/* 주요 정보 */}
              <div className="flex flex-col gap-2">
                {data.addr1 && (
                  <div className="flex items-start gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4 text-pink-400 mt-0.5 shrink-0" />
                    <span>{data.addr1} {data.addr2}</span>
                  </div>
                )}
                {data.tel && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="w-4 h-4 text-pink-400 shrink-0" />
                    <span>{data.tel}</span>
                  </div>
                )}
                {data.intro?.usetime && (
                  <div className="flex items-start gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4 text-pink-400 mt-0.5 shrink-0" />
                    <span>{data.intro.usetime}</span>
                  </div>
                )}
                {data.intro?.restdate && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="text-pink-400 text-xs font-medium shrink-0">휴무</span>
                    <span>{data.intro.restdate}</span>
                  </div>
                )}
                {data.parkingAvailable && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <ParkingSquare className="w-4 h-4 text-pink-400 shrink-0" />
                    <span>주차 가능</span>
                  </div>
                )}
              </div>

              {/* 음식점 가격 정보 */}
              {data.representativeMenuName && (
                <div className="p-3 bg-gray-50 rounded-xl text-sm">
                  <span className="text-gray-500">대표 메뉴</span>
                  <div className="flex justify-between mt-1">
                    <span className="font-medium text-gray-800">{data.representativeMenuName}</span>
                    {data.representativePrice && (
                      <span className="text-pink-500 font-semibold">
                        {data.representativePrice.toLocaleString()}원
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* 설명 */}
              {data.overview && (
                <p className="text-sm text-gray-600 leading-relaxed line-clamp-4">
                  {data.overview}
                </p>
              )}

              {/* 홈페이지 링크 */}
              {data.homepage && (
                <a
                  href={extractUrl(data.homepage)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 w-full py-3
                             rounded-xl border border-navy-500 text-navy-500 text-sm font-medium"
                >
                  <ExternalLink className="w-4 h-4" />
                  홈페이지 바로가기
                </a>
              )}
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-60">
            <span className="text-sm text-gray-400">정보를 불러올 수 없어요</span>
          </div>
        )}
      </div>
    </>
  );
}
