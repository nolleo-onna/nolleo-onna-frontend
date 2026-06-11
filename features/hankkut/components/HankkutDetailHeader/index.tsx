"use client";

import { ArrowLeft, Bookmark } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import type { HankkutDetail } from "@/features/hankkut/data/hankkutDetail";

const CATEGORY_BADGE_STYLES: Record<HankkutDetail["category"], string> = {
  "오늘 행사": "bg-pink-500 text-white",
  "무료로 즐기기": "bg-lime-300 text-navy-900",
  "할인 혜택 팁": "bg-navy-900 text-lime-300",
};

interface HankkutDetailHeaderProps {
  hankkut: HankkutDetail;
}

export default function HankkutDetailHeader({
  hankkut,
}: HankkutDetailHeaderProps) {
  const router = useRouter();

  return (
    <section className="relative overflow-hidden rounded-3xl">
      <div className="relative aspect-[16/7] w-full">
        <Image
          src={hankkut.imageUrl}
          alt={hankkut.title}
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/10" />
      </div>

      {/* 상단 버튼 */}
      <div className="absolute inset-x-0 top-0 flex items-center justify-between p-5">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="뒤로 가기"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-navy-900 transition-colors hover:bg-white"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          aria-label="저장하기"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-navy-900 transition-colors hover:bg-white"
        >
          <Bookmark className="h-5 w-5" />
        </button>
      </div>

      {/* 하단 정보 오버레이 */}
      <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
        <div className="flex items-center gap-2">
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-bold ${CATEGORY_BADGE_STYLES[hankkut.category]}`}
          >
            {hankkut.category}
          </span>
          <span className="text-xs font-medium text-white/80">
            {hankkut.region} · {hankkut.date}
          </span>
        </div>
        <h1 className="mt-3 text-2xl font-bold text-white md:text-3xl">
          {hankkut.title}
        </h1>
        <p className="mt-2 text-sm text-pink-300 md:text-base">
          {hankkut.summary}
        </p>
      </div>
    </section>
  );
}
