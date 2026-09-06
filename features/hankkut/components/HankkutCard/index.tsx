import { Eye, Quote } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import type { WeeklyBestItem } from "@/features/hankkut/utils/weeklyBestFeed";

interface HankkutCardProps {
  item: WeeklyBestItem;
  featured?: boolean;
}

export default function HankkutCard({ item, featured = false }: HankkutCardProps) {
  // 자유게시판 글의 imageDataUrl(base64)은 next/image가 최적화할 수 없어서
  // http(s) 이미지가 있을 때만 사진 카드로 보여준다.
  const showImage = item.imageUrl?.startsWith("http");

  if (!showImage) {
    // 사진 없는 글은 빈 이미지 자리에 이모지만 띄우지 않고, 글 자체가
    // 주인공인 "인용카드" 형태로 보여준다 — 자유게시판 글이 대부분이라
    // 빈 플레이스홀더가 뜨면 페이지 전체가 깨진 것처럼 보이기 때문.
    return (
      <Link
        href={item.href}
        className={`group flex h-full flex-col justify-between overflow-hidden rounded-2xl bg-gradient-to-br from-navy-900 via-navy-800 to-ocean-800 p-5 transition-transform duration-300 hover:-translate-y-1 ${
          featured ? "min-h-[15rem] md:p-6" : "min-h-[11rem]"
        }`}
      >
        <div>
          <div className="flex items-center justify-between">
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-bold ${item.badgeClassName}`}
            >
              {item.badgeLabel}
            </span>
            <Quote className="h-4 w-4 shrink-0 text-white/25" aria-hidden />
          </div>

          <h2
            className={`mt-3 font-bold leading-snug text-white ${
              featured ? "text-xl md:text-2xl" : "text-base"
            }`}
          >
            {item.title}
          </h2>

          {featured && item.summary && (
            <p className="mt-2 hidden line-clamp-3 text-sm text-white/70 md:block">
              {item.summary}
            </p>
          )}
        </div>

        <div className="mt-3 flex items-center gap-3 text-xs text-white/50">
          <span>{item.metaLabel}</span>
          <span className="flex items-center gap-1">
            <Eye className="h-3.5 w-3.5" />
            {item.views.toLocaleString()}
          </span>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={item.href}
      className="group relative block h-full overflow-hidden rounded-2xl"
    >
      {/* 이미지 — 높이는 항상 16:10 비율로 고정하고, "더 커 보이는" 효과는
          카드를 담는 그리드 쪽에서 폭을 넓게 줘서 만든다(시상대 레이아웃) */}
      <div className="relative aspect-[16/10] w-full overflow-hidden">
        <Image
          src={item.imageUrl!}
          alt={item.title}
          fill
          sizes="(max-width: 744px) 100vw, (max-width: 1280px) 50vw, 33vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      </div>

      {/* 콘텐츠 오버레이 */}
      <div className="absolute inset-x-0 bottom-0 p-5">
        <div className="flex items-center gap-2">
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-bold ${item.badgeClassName}`}
          >
            {item.badgeLabel}
          </span>
        </div>

        <h2
          className={`mt-2 font-bold text-white ${
            featured ? "text-xl md:text-2xl" : "text-base"
          }`}
        >
          {item.title}
        </h2>

        {featured && item.summary && (
          <p className="mt-1.5 hidden line-clamp-2 text-sm text-white/80 md:block">
            {item.summary}
          </p>
        )}

        <div className="mt-2 flex items-center gap-3 text-xs text-white/60">
          <span>{item.metaLabel}</span>
          <span className="flex items-center gap-1">
            <Eye className="h-3.5 w-3.5" />
            {item.views.toLocaleString()}
          </span>
        </div>
      </div>
    </Link>
  );
}
