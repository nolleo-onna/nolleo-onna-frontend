"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { X, MapPin, Phone, Clock, ParkingSquare, ExternalLink } from "lucide-react";
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
  onClose: () => void;
};

const extractUrl = (homepage: string) => {
  const match = homepage.match(/href=["']([^"']+)["']/);
  return match ? match[1] : homepage;
};

const stripHtml = (html: string) =>
  html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();

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
    <div className="flex flex-col gap-2 p-3 bg-gray-50 rounded-xl">
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
              className="flex-1 py-2 rounded-lg bg-navy-400 text-white text-sm font-semibold disabled:opacity-40 hover:bg-navy-500 transition-colors"
            >
              {isPending ? "저장 중..." : "등록"}
            </button>
            {editing && (
              <button
                onClick={handleCancel}
                className="flex-1 py-2 rounded-lg border border-gray-200 text-gray-500 text-sm font-semibold hover:bg-gray-50 transition-colors"
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

export default function SpotDetailModal({ contentId, placeType, mapPlaceId, onClose }: Props) {
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
            className="fixed inset-0 bg-black/40 z-40"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          />
          <motion.div
            className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg max-h-[80vh] overflow-y-auto bg-white rounded-2xl shadow-xl"
            role="dialog"
            aria-modal="true"
            aria-label="장소 상세 정보"
            initial={{ opacity: 0, x: "-50%", y: "calc(-50% + 24px)", scale: 0.98 }}
            animate={{ opacity: 1, x: "-50%", y: "-50%", scale: 1 }}
            exit={{ opacity: 0, x: "-50%", y: "calc(-50% + 16px)", scale: 0.98 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
          >
        {isPending ? (
          <div className="flex items-center justify-center h-60">
            <span className="text-sm text-gray-400">불러오는 중...</span>
          </div>
        ) : placeType === "SPOT" && spotData ? (
          <>
            <div className="relative h-56 bg-gray-100">
              {spotData.firstImage ? (
                <Image
                  src={spotData.firstImage}
                  alt={spotData.title}
                  fill
                  sizes="(max-width: 512px) 100vw, 512px"
                  className="object-cover rounded-t-2xl"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300 text-sm">
                  이미지 없음
                </div>
              )}
              <button
                onClick={onClose}
                className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition z-10"
              >
                <X className="w-4 h-4" />
              </button>
              {favoriteId !== null && (
                <FavoriteButton
                  isFavorite={isFavorite}
                  disabled={isTogglingFavorite}
                  onToggle={() =>
                    handleToggleFavorite(spotData.title, spotData.firstImage ?? null)
                  }
                  className="absolute top-3 right-12 w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 z-10"
                />
              )}
            </div>
            <div className="p-5 flex flex-col gap-4">
              <h2 className="text-xl font-bold text-gray-900">{spotData.title}</h2>
              <div className="flex flex-col gap-2">
                {spotData.addr1 && (
                  <div className="flex items-start gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4 text-ocean-500 mt-0.5 shrink-0" />
                    <span>{spotData.addr1} {spotData.addr2}</span>
                  </div>
                )}
                {spotData.tel && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="w-4 h-4 text-ocean-500 shrink-0" />
                    <span>{spotData.tel}</span>
                  </div>
                )}
                {spotData.intro?.usetime && (
                  <div className="flex items-start gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4 text-ocean-500 mt-0.5 shrink-0" />
                    <span>{spotData.intro.usetime}</span>
                  </div>
                )}
                {spotData.intro?.restdate && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="text-ocean-500 text-xs font-medium shrink-0">휴무</span>
                    <span>{spotData.intro.restdate}</span>
                  </div>
                )}
                {spotData.parkingAvailable && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <ParkingSquare className="w-4 h-4 text-ocean-500 shrink-0" />
                    <span>주차 가능</span>
                  </div>
                )}
              </div>
              {spotData.overview && (
                <p className="text-sm text-gray-600 leading-relaxed line-clamp-4">
                  {stripHtml(spotData.overview)}
                </p>
              )}
              {mapPlaceId != null && mapPlaceId > 0 && <StarRating mapPlaceId={mapPlaceId} />}
              {spotData.homepage && (
                <a
                  href={extractUrl(spotData.homepage)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 w-full py-3 rounded-xl border border-navy-500 text-navy-500 text-sm font-medium"
                >
                  <ExternalLink className="w-4 h-4" />
                  홈페이지 바로가기
                </a>
              )}
            </div>
          </>
        ) : placeType === "FOOD" && foodData ? (
          <>
            {/* 음식점은 백엔드에서 이미지를 내려주지 않아, 빈 이미지 칸 대신
                이름/카테고리를 바로 보여주는 헤더로 그 공간을 채운다. */}
            <div className="relative flex items-center gap-3 rounded-t-2xl bg-gradient-to-br from-amber-50 to-orange-50 px-5 pt-5 pb-4">
              <button
                onClick={onClose}
                className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60 transition"
              >
                <X className="w-4 h-4" />
              </button>
              {favoriteId !== null && (
                <FavoriteButton
                  isFavorite={isFavorite}
                  disabled={isTogglingFavorite}
                  onToggle={() => handleToggleFavorite(foodData.name, null)}
                  className="absolute top-3 right-12 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60"
                />
              )}
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm">
                🍽️
              </div>
              <div className="flex min-w-0 flex-col gap-1">
                <h2 className={`truncate text-xl font-bold text-gray-900 ${favoriteId !== null ? "pr-16" : "pr-8"}`}>{foodData.name}</h2>
                {foodData.normalizedCategory && (
                  <span className="w-fit rounded-full bg-white/80 px-2 py-0.5 text-xs font-medium text-amber-700">
                    {foodData.normalizedCategory}
                  </span>
                )}
              </div>
            </div>
            <div className="p-5 flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                {foodData.address && (
                  <div className="flex items-start gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4 text-ocean-500 mt-0.5 shrink-0" />
                    <span>{foodData.address}</span>
                  </div>
                )}
                {foodData.tel && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="w-4 h-4 text-ocean-500 shrink-0" />
                    <span>{foodData.tel}</span>
                  </div>
                )}
                {foodData.businessHoursRaw && (
                  <div className="flex items-start gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4 text-ocean-500 mt-0.5 shrink-0" />
                    <span>{foodData.businessHoursRaw}</span>
                  </div>
                )}
                {foodData.parkingAvailable && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <ParkingSquare className="w-4 h-4 text-ocean-500 shrink-0" />
                    <span>주차 가능</span>
                  </div>
                )}
              </div>
              {foodData.description && (
                <p className="text-sm text-gray-600 leading-relaxed line-clamp-4">
                  {stripHtml(foodData.description)}
                </p>
              )}
              {foodData.menus.length > 0 && (
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">메뉴</span>
                  {foodData.menus.map((menu, i) => (
                    <div
                      key={i}
                      className={`flex justify-between p-3 rounded-xl text-sm ${menu.representative ? "bg-navy-50" : "bg-gray-50"}`}
                    >
                      <span className={`font-medium ${menu.representative ? "text-navy-600" : "text-gray-800"}`}>
                        {menu.representative && "⭐ "}{menu.menuName}
                      </span>
                      {menu.price && (
                        <span className="text-ocean-600 font-semibold">
                          {menu.price.toLocaleString()}원
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
              {mapPlaceId && <StarRating mapPlaceId={mapPlaceId} />}
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-60">
            <span className="text-sm text-gray-400">정보를 불러올 수 없어요</span>
          </div>
        )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}