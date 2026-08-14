import { Eye } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import type { Hankkut } from "@/features/hankkut/data/mockHankkut";

const CATEGORY_BADGE_STYLES: Record<Hankkut["category"], string> = {
  "오늘 행사": "bg-pink-500 text-white",
  "무료로 즐기기": "bg-lime-300 text-navy-900",
  "할인 혜택 팁": "bg-navy-900 text-lime-300",
};

interface HankkutCardProps {
  hankkut: Hankkut;
  featured?: boolean;
}

export default function HankkutCard({
  hankkut,
  featured = false,
}: HankkutCardProps) {
  return (
    <Link
      href={`/hankkut/${hankkut.id}`}
      className={`group relative block overflow-hidden rounded-2xl ${
        featured ? "md:col-span-2 md:row-span-2" : ""
      }`}
    >
      {/* 이미지 */}
      <div
        className={`relative w-full overflow-hidden ${
          featured ? "aspect-[16/10] md:h-full md:aspect-auto" : "aspect-[16/10]"
        }`}
      >
        <Image
          src={hankkut.imageUrl}
          alt={hankkut.title}
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
            className={`rounded-full px-2.5 py-1 text-xs font-bold ${CATEGORY_BADGE_STYLES[hankkut.category]}`}
          >
            {hankkut.category}
          </span>
          <span className="text-xs font-medium text-white/70">
            {hankkut.region}
          </span>
        </div>

        <h2
          className={`mt-2 font-bold text-white ${
            featured ? "text-xl md:text-2xl" : "text-base"
          }`}
        >
          {hankkut.title}
        </h2>

        {featured && (
          <p className="mt-1.5 hidden text-sm text-white/80 md:block">
            {hankkut.summary}
          </p>
        )}

        <div className="mt-2 flex items-center gap-3 text-xs text-white/60">
          <span>{hankkut.date}</span>
          <span className="flex items-center gap-1">
            <Eye className="h-3.5 w-3.5" />
            {hankkut.views.toLocaleString()}
          </span>
        </div>
      </div>
    </Link>
  );
}
