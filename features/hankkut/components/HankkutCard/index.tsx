import { Eye } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import type { WeeklyBestItem } from "@/features/hankkut/utils/weeklyBestFeed";

interface HankkutCardProps {
  item: WeeklyBestItem;
  featured?: boolean;
}

export default function HankkutCard({ item, featured = false }: HankkutCardProps) {
  // 자유게시판 글의 imageDataUrl(base64)은 next/image가 최적화할 수 없어서
  // http(s) 이미지가 있을 때만 렌더링하고, 없으면 이모지 플레이스홀더로 채운다.
  const showImage = item.imageUrl?.startsWith("http");

  return (
    <Link
      href={item.href}
      className="group relative block h-full overflow-hidden rounded-2xl"
    >
      {/* 이미지 — 높이는 항상 16:10 비율로 고정하고, "더 커 보이는" 효과는
          카드를 담는 그리드 쪽에서 폭을 넓게 줘서 만든다(시상대 레이아웃) */}
      <div className="relative aspect-[16/10] w-full overflow-hidden">
        {showImage ? (
          <Image
            src={item.imageUrl!}
            alt={item.title}
            fill
            sizes="(max-width: 744px) 100vw, (max-width: 1280px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-navy-100 via-white to-ocean-100 text-4xl">
            ✍️
          </div>
        )}
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
