"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { X, MapPin, Phone, Clock, ParkingSquare, ExternalLink, CalendarX } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { useSpotDetail } from "@/features/spot/hooks/useSpotDetail";
import { mapPlaceKeys } from "@/features/spot/hooks/useMapPlaces";
import { useFavoriteStatus, useToggleFavorite } from "@/features/spot/hooks/useFavorites";
import FavoriteButton from "@/features/spot/components/FavoriteButton";
import { fetchFoodDetail, postReview, patchReview } from "@/features/spot/apis/spot";
type Props = {
  contentId: string | null;
  placeType: "SPOT" | "FOOD" | null;
  mapPlaceId: number | null;
  /** 마커 클릭 경로에서 mapPlaceId 매핑이 아직 로딩 중인지 — 찜·별점 자리에 스켈레톤 표시 */
  isMapPlaceIdLoading?: boolean;
  onClose: () => void;
};

const extractUrl = (homepage: string) => {
  const match = homepage.match(/href=["']([^"']+)["']/);
  return match ? match[1] : homepage;
};

const stripHtml = (html: string) =>
  html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();

// 헤더 이미지 위에 겹치는 반투명 유리 버튼 스타일
const GLASS_BUTTON =
  "flex items-center justify-center rounded-full bg-white/15 text-white border border-white/25 backdrop-blur-md transition-colors hover:bg-white/35";

function InfoRow({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-white/70 bg-ocean-50/70 text-ocean-500">
        {icon}
      </span>
      <span className="min-w-0 pt-1.5 text-sm leading-relaxed text-gray-600">
        {children}
      </span>
    </div>
  );
}

function StarRating({ mapPlaceId }: { mapPlaceId: number }) {
  const storageKey = `rating_${mapPlaceId}`;
  const savedRating = typeof window !== "undefined"
    ? Number(localStorage.getItem(storageKey) ?? 0)
    : 0;

  const [hovered, setHovered] = useState(0);
  const [selected, setSelected] = useState(savedRating);
  const [submitted, setSubmitted] = useState(savedRating > 0);
  const [editing, setEditing] = useState(false);
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
  mutationFn: (rating: number) => {
    const already = Number(localStorage.getItem(storageKey) ?? 0) > 0;
    return already ? patchReview(mapPlaceId, rating) : postReview(mapPlaceId, rating);
  },
  onSuccess: () => {
    localStorage.setItem(storageKey, String(selected));
    setSubmitted(true);
    setEditing(false);
    queryClient.invalidateQueries({ queryKey: mapPlaceKeys.all });
  },
});

  const handleSubmit = () => {
    if (selected === 0) return;
    mutate(selected);
  };

  const handleCancel = () => {
    const saved = Number(localStorage.getItem(storageKey) ?? 0);
    setSelected(saved);
    setEditing(false);
    setHovered(0);
  };

  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-white/70 bg-white/55 p-4">
      <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">내 별점</span>

      {submitted && !editing ? (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <svg key={star} width="24" height="24" viewBox="0 0 24 24" fill={star <= selected ? "#facc15" : "#e5e7eb"}>
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            ))}
            <span className="ml-1 text-sm font-semibold text-gray-600">{selected}점</span>
          </div>
          <button onClick={() => setEditing(true)} className="text-xs text-navy-400 font-medium hover:underline">
            수정
          </button>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                disabled={isPending}
                onMouseEnter={() => setHovered(star)}
                onMouseLeave={() => setHovered(0)}
                onClick={() => setSelected(star)}
                className="transition-transform hover:scale-110 disabled:opacity-50"
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill={star <= (hovered || selected) ? "#facc15" : "#e5e7eb"}>
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </button>
            ))}
            {selected > 0 && (
              <span className="ml-1 text-sm font-semibold text-gray-600">{selected}점</span>
            )}
          </div>
          <div className="flex gap-2 mt-1">
            <button
              onClick={handleSubmit}
              disabled={selected === 0 || isPending}
              className="flex-1 rounded-xl bg-ocean-500 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-ocean-600 active:scale-[0.98] disabled:opacity-40"
            >
              {isPending ? "저장 중..." : "등록"}
            </button>
            {editing && (
              <button
                onClick={handleCancel}
                className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-500 transition-colors hover:bg-gray-100"
              >
                취소
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default function SpotDetailModal({ contentId, placeType, mapPlaceId, isMapPlaceIdLoading = false, onClose }: Props) {
  const { data: spotData, isPending: spotPending } = useSpotDetail(
    placeType === "SPOT" ? contentId : null
  );

  const { data: foodData, isPending: foodPending } = useQuery({
    queryKey: ["food", "detail", contentId],
    queryFn: () => fetchFoodDetail(contentId!),
    enabled: !!contentId && placeType === "FOOD",
    staleTime: 1000 * 60 * 10,
  });

  const isPending = placeType === "SPOT" ? spotPending : foodPending;

  // 지도 마커 클릭 경로에서는 mapPlaceId가 0으로 올 수 있어, 유효한 id일 때만
  // 찜 버튼을 노출한다.
  const favoriteId = mapPlaceId !== null && mapPlaceId > 0 ? mapPlaceId : null;
  const { data: isFavorite = false } = useFavoriteStatus(favoriteId);
  const { mutate: toggleFavorite, isPending: isTogglingFavorite } = useToggleFavorite();

  const handleToggleFavorite = (name: string, imageUrl: string | null) => {
    if (favoriteId === null || placeType === null) return;
    toggleFavorite({
      mapPlaceId: favoriteId,
      place: { name, placeType, imageUrl, originalId: contentId },
    });
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <AnimatePresence>
      {contentId && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-navy-900/25 backdrop-blur-[3px]"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          />
          <motion.div
            className="scrollbar-hide fixed left-1/2 top-1/2 z-50 max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-[32px] border border-white/60 bg-white/75 backdrop-blur-2xl shadow-[0_32px_80px_-20px_rgba(13,48,128,0.5)]"
            role="dialog"
            aria-modal="true"
            aria-label="장소 상세 정보"
            initial={{ opacity: 0, x: "-50%", y: "calc(-50% + 24px)", scale: 0.98 }}
            animate={{ opacity: 1, x: "-50%", y: "-50%", scale: 1 }}
            exit={{ opacity: 0, x: "-50%", y: "calc(-50% + 16px)", scale: 0.98 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
          >
        {isPending ? (
          <div className="flex flex-col">
            <div className="animate-shimmer h-64 w-full" />
            <div className="flex flex-col gap-3 p-6">
              <div className="animate-shimmer h-6 w-2/3 rounded-lg" />
              <div className="animate-shimmer h-4 w-full rounded-lg" />
              <div className="animate-shimmer h-4 w-5/6 rounded-lg" />
              <div className="animate-shimmer h-12 w-full rounded-2xl" />
            </div>
          </div>
        ) : placeType === "SPOT" && spotData ? (
          <>
            {/* 히어로 이미지 — 제목·주소를 이미지 위에 겹쳐 잡지 표지처럼 */}
            <div className="relative h-64 bg-gray-100">
              {spotData.firstImage ? (
                <Image
                  src={spotData.firstImage}
                  alt={spotData.title}
                  fill
                  sizes="(max-width: 512px) 100vw, 512px"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-ocean-500 to-navy-600 text-5xl">
                  🌊
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-black/10" />

              <button onClick={onClose} aria-label="닫기" className={`absolute right-4 top-4 z-10 h-9 w-9 ${GLASS_BUTTON}`}>
                <X className="h-4 w-4" />
              </button>
              {favoriteId !== null ? (
                <FavoriteButton
                  isFavorite={isFavorite}
                  disabled={isTogglingFavorite}
                  onToggle={() =>
                    handleToggleFavorite(spotData.title, spotData.firstImage ?? null)
                  }
                  className={`absolute right-[60px] top-4 z-10 h-9 w-9 ${GLASS_BUTTON}`}
                />
              ) : isMapPlaceIdLoading ? (
                <div className="animate-shimmer absolute right-[60px] top-4 z-10 h-9 w-9 rounded-full" />
              ) : null}

              <div className="absolute inset-x-0 bottom-0 p-5">
                <h2 className="text-2xl font-bold text-white drop-shadow-sm">{spotData.title}</h2>
                {spotData.addr1 && (
                  <p className="mt-1 flex items-center gap-1 text-[13px] text-white/85">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{spotData.addr1} {spotData.addr2}</span>
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-5 p-6">
              {/* 한눈에 보는 특징 칩 */}
              {(spotData.parkingAvailable || spotData.intro?.restdate) && (
                <div className="flex flex-wrap gap-2">
                  {spotData.parkingAvailable && (
                    <span className="flex items-center gap-1.5 rounded-full border border-white/70 bg-white/55 px-3 py-1.5 text-xs font-semibold text-gray-700">
                      <ParkingSquare className="h-3.5 w-3.5 text-ocean-500" />
                      주차 가능
                    </span>
                  )}
                  {spotData.intro?.restdate && (
                    <span className="flex items-center gap-1.5 rounded-full border border-white/70 bg-white/55 px-3 py-1.5 text-xs font-semibold text-gray-700">
                      <CalendarX className="h-3.5 w-3.5 text-ocean-500" />
                      휴무 {spotData.intro.restdate}
                    </span>
                  )}
                </div>
              )}

              {(spotData.tel || spotData.intro?.usetime) && (
                <div className="flex flex-col gap-3">
                  {spotData.tel && (
                    <InfoRow icon={<Phone className="h-4 w-4" />}>{spotData.tel}</InfoRow>
                  )}
                  {spotData.intro?.usetime && (
                    <InfoRow icon={<Clock className="h-4 w-4" />}>{spotData.intro.usetime}</InfoRow>
                  )}
                </div>
              )}

              {spotData.overview && (
                <p className="rounded-2xl border border-white/60 bg-gradient-to-br from-ocean-50/60 to-ocean-100/30 p-4 text-sm leading-relaxed text-gray-700 line-clamp-5">
                  {stripHtml(spotData.overview)}
                </p>
              )}

              {mapPlaceId != null && mapPlaceId > 0 ? (
                <StarRating mapPlaceId={mapPlaceId} />
              ) : isMapPlaceIdLoading ? (
                <div className="animate-shimmer h-24 rounded-2xl" />
              ) : null}

              {spotData.homepage && (
                <a
                  href={extractUrl(spotData.homepage)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-1.5 rounded-2xl bg-ocean-500 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-ocean-600 active:scale-[0.98]"
                >
                  <ExternalLink className="h-4 w-4" />
                  홈페이지 바로가기
                </a>
              )}
            </div>
          </>
        ) : placeType === "FOOD" && foodData ? (
          <>
            {/* 음식점은 백엔드에서 이미지를 내려주지 않아, 빈 이미지 칸 대신
                이름/카테고리를 바로 보여주는 헤더로 그 공간을 채운다. */}
            <div className="relative overflow-hidden bg-gradient-to-br from-amber-100/50 via-orange-50/40 to-transparent px-6 pb-5 pt-6">
              <div className="pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full bg-orange-100/70 blur-2xl" />
              <button
                onClick={onClose}
                aria-label="닫기"
                className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/70 text-gray-500 shadow-sm backdrop-blur-sm transition-colors hover:bg-white hover:text-gray-800"
              >
                <X className="h-4 w-4" />
              </button>
              {favoriteId !== null ? (
                <FavoriteButton
                  isFavorite={isFavorite}
                  disabled={isTogglingFavorite}
                  onToggle={() => handleToggleFavorite(foodData.name, null)}
                  className="absolute right-[60px] top-4 z-10 h-9 w-9 rounded-full bg-white/70 shadow-sm backdrop-blur-sm hover:bg-white"
                />
              ) : isMapPlaceIdLoading ? (
                <div className="animate-shimmer absolute right-[60px] top-4 z-10 h-9 w-9 rounded-full" />
              ) : null}

              <div className="relative flex items-center gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white text-3xl shadow-md">
                  🍽️
                </div>
                <div className="flex min-w-0 flex-col gap-1.5">
                  <h2 className={`truncate text-2xl font-bold text-gray-900 ${favoriteId !== null ? "pr-16" : "pr-8"}`}>{foodData.name}</h2>
                  {foodData.normalizedCategory && (
                    <span className="w-fit rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-amber-700 shadow-sm">
                      {foodData.normalizedCategory}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-5 p-6">
              {foodData.parkingAvailable && (
                <div className="flex flex-wrap gap-2">
                  <span className="flex items-center gap-1.5 rounded-full border border-white/70 bg-white/55 px-3 py-1.5 text-xs font-semibold text-gray-700">
                    <ParkingSquare className="h-3.5 w-3.5 text-ocean-500" />
                    주차 가능
                  </span>
                </div>
              )}

              {(foodData.address || foodData.tel || foodData.businessHoursRaw) && (
                <div className="flex flex-col gap-3">
                  {foodData.address && (
                    <InfoRow icon={<MapPin className="h-4 w-4" />}>{foodData.address}</InfoRow>
                  )}
                  {foodData.tel && (
                    <InfoRow icon={<Phone className="h-4 w-4" />}>{foodData.tel}</InfoRow>
                  )}
                  {foodData.businessHoursRaw && (
                    <InfoRow icon={<Clock className="h-4 w-4" />}>{foodData.businessHoursRaw}</InfoRow>
                  )}
                </div>
              )}

              {foodData.description && (
                <p className="rounded-2xl border border-white/60 bg-gradient-to-br from-amber-50/60 to-orange-50/30 p-4 text-sm leading-relaxed text-gray-700 line-clamp-5">
                  {stripHtml(foodData.description)}
                </p>
              )}

              {foodData.menus.length > 0 && (
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-gray-500">메뉴</span>
                  {foodData.menus.map((menu, i) => (
                    <div
                      key={i}
                      className={`flex items-center justify-between rounded-2xl p-3.5 text-sm ${
                        menu.representative
                          ? "bg-navy-900 text-white"
                          : "border border-white/70 bg-white/55 text-gray-800"
                      }`}
                    >
                      <span className="flex items-center gap-1.5 font-medium">
                        {menu.representative && (
                          <span className="rounded-full bg-ocean-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                            대표
                          </span>
                        )}
                        {menu.menuName}
                      </span>
                      {menu.price && (
                        <span className={`font-bold ${menu.representative ? "text-ocean-100" : "text-ocean-600"}`}>
                          {menu.price.toLocaleString()}원
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {mapPlaceId != null && mapPlaceId > 0 ? (
                <StarRating mapPlaceId={mapPlaceId} />
              ) : isMapPlaceIdLoading ? (
                <div className="animate-shimmer h-24 rounded-2xl" />
              ) : null}
            </div>
          </>
        ) : (
          <div className="flex h-60 flex-col items-center justify-center gap-2">
            <span className="text-3xl">🧭</span>
            <span className="text-sm text-gray-400">정보를 불러올 수 없어요</span>
          </div>
        )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
