"use client";

import { Heart } from "lucide-react";

interface FavoriteButtonProps {
  isFavorite: boolean;
  onToggle: () => void;
  disabled?: boolean;
  className?: string;
  iconClassName?: string;
}

// 하트 모양 찜 토글 버튼(표시 전용).
// 목록 카드 안에서도 쓰이므로 클릭이 카드 선택으로 번지지 않게 여기서 막는다.
export default function FavoriteButton({
  isFavorite,
  onToggle,
  disabled = false,
  className = "",
  iconClassName = "h-4 w-4",
}: FavoriteButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      aria-label={isFavorite ? "찜 해제" : "찜하기"}
      aria-pressed={isFavorite}
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      className={`flex items-center justify-center transition disabled:opacity-50 ${className}`}
    >
      <Heart
        className={`${iconClassName} transition-colors ${
          isFavorite ? "fill-pink-500 text-pink-500" : "text-gray-300"
        }`}
      />
    </button>
  );
}
