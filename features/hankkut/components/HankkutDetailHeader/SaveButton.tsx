"use client";

import { Bookmark } from "lucide-react";

import { useHankkutBookmark } from "@/features/hankkut/hooks/useHankkutBookmark";

export default function SaveButton({ id }: { id: number }) {
  const { isBookmarked, toggle } = useHankkutBookmark(id);

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isBookmarked ? "찜 해제하기" : "찜하기"}
      aria-pressed={isBookmarked}
      className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
        isBookmarked
          ? "bg-navy-900 text-lime-300"
          : "bg-white/90 text-navy-900 hover:bg-white"
      }`}
    >
      <Bookmark className={`h-5 w-5 ${isBookmarked ? "fill-current" : ""}`} />
    </button>
  );
}
