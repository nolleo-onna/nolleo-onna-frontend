import { MapPin, Sparkles } from "lucide-react";
import Link from "next/link";

import type { HankkutDetail } from "@/features/hankkut/data/hankkutDetail";

interface HankkutDetailContentProps {
  hankkut: HankkutDetail;
}

export default function HankkutDetailContent({
  hankkut,
}: HankkutDetailContentProps) {
  return (
    <article>
      {/* 해시태그 */}
      <div className="flex flex-wrap gap-2">
        {hankkut.hashtags.map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600"
          >
            #{tag}
          </span>
        ))}
      </div>

      {/* 한끗 정보 */}
      <section className="mt-8">
        <h2 className="flex items-center gap-2 text-lg font-bold text-navy-900">
          <Sparkles className="h-5 w-5 text-ocean-600" />
          한끗 정보
        </h2>
        <div className="mt-4 rounded-2xl bg-gray-50 p-6">
          <p className="text-sm leading-7 text-gray-700">{hankkut.content}</p>
        </div>
      </section>

      {/* 관련 스팟 */}
      {hankkut.relatedSpots.length > 0 && (
        <section className="mt-10">
          <h2 className="flex items-center gap-2 text-lg font-bold text-navy-900">
            <MapPin className="h-5 w-5 text-ocean-600" />
            관련 스팟
          </h2>
          <ul className="mt-4 space-y-3">
            {hankkut.relatedSpots.map((spot) => (
              <li key={spot.id}>
                <Link
                  href={`/spot?keyword=${encodeURIComponent(spot.name)}`}
                  className="flex items-center justify-between rounded-2xl border border-gray-100 p-4 transition-colors hover:border-ocean-300"
                >
                  <div>
                    <p className="text-sm font-semibold text-navy-900">
                      {spot.name}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-400">
                      {spot.region} · {spot.price}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-ocean-600">
                    보기 →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
