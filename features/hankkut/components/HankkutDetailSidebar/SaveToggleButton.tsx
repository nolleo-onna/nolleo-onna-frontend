"use client";

import { Bookmark } from "lucide-react";

import { useHankkutBookmark } from "@/features/hankkut/hooks/useHankkutBookmark";

export default function SaveToggleButton({ id }: { id: number }) {
  const { isBookmarked, toggle } = useHankkutBookmark(id);

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={isBookmarked}
      className={`flex w-full items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-bold transition-all ${
        isBookmarked
          ? "bg-lime-300 text-navy-900"
          : "bg-navy-900 text-lime-300 hover:opacity-90"
      }`}
    >
      <Bookmark className={`h-4 w-4 ${isBookmarked ? "fill-current" : ""}`} />
      {isBookmarked ? "찜 완료" : "찜하기"}
    </button>
  );
}
