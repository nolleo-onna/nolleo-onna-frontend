"use client";

import { useRouter } from "next/navigation";

import { Heart } from "lucide-react";

import { cn } from "@/utils/cn";
import {
  useFavoriteList,
  useFavoriteToggle,
} from "@/features/spot/hooks/useFavorites";

interface FavoriteButtonProps {
  mapPlaceId: number;
  size?: "sm" | "md";
  className?: string;
}

// 장소 찜 하트 버튼. 서버(/api/v1/favorites)에 저장되므로 기기 간 동기화된다.
// 비로그인 상태에서 누르면 로그인 페이지로 보낸다.
export default function FavoriteButton({
  mapPlaceId,
  size = "md",
  className,
}: FavoriteButtonProps) {
  const router = useRouter();
  const { favoriteIds, isLoggedIn } = useFavoriteList();
  const { mutate, isPending } = useFavoriteToggle();

  const isFavorited = favoriteIds.has(mapPlaceId);

  const handleClick = (e: React.MouseEvent) => {
    // 카드 전체가 클릭 영역인 곳에 겹쳐 쓰이므로 클릭 전파를 끊는다
    e.stopPropagation();
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }
    if (isPending) return;
    mutate(mapPlaceId);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      aria-label={isFavorited ? "찜 해제" : "찜하기"}
      aria-pressed={isFavorited}
      className={cn(
        "flex items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur-sm transition-transform hover:scale-110 active:scale-95 disabled:opacity-60",
        size === "md" ? "h-9 w-9" : "h-7 w-7",
        className
      )}
    >
      <Heart
        className={cn(
          size === "md" ? "h-4.5 w-4.5" : "h-3.5 w-3.5",
          "transition-colors",
          isFavorited ? "fill-pink-500 text-pink-500" : "text-gray-400"
        )}
      />
    </button>
  );
}
