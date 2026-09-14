import { ArrowUpRight, MapPin, Sparkles } from "lucide-react";
import Link from "next/link";

import type { HankkutDetail } from "@/features/hankkut/data/hankkutDetail";

interface HankkutDetailContentProps {
  hankkut: HankkutDetail;
}

function SectionTitle({ icon: Icon, children }: { icon: typeof MapPin; children: React.ReactNode }) {
  return (
    <h2 className="flex items-center gap-2 text-sm font-bold text-navy-900">
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-ocean-50">
        <Icon className="h-3.5 w-3.5 text-ocean-600" />
      </span>
      {children}
    </h2>
  );
}

export default function HankkutDetailContent({ hankkut }: HankkutDetailContentProps) {
  return (
    <article className="rounded-[28px] bg-white p-6 ring-1 ring-gray-100 md:p-9">
      <SectionTitle icon={Sparkles}>한끗 정보</SectionTitle>
      <p className="mt-4 text-[15px] leading-8 text-gray-700 break-keep">{hankkut.content}</p>

      <div className="mt-6 flex flex-wrap gap-2">
        {hankkut.hashtags.map((tag) => (
          <span key={tag} className="rounded-full bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-100">
            #{tag}
          </span>
        ))}
      </div>

      {hankkut.relatedSpots.length > 0 && (
        <section className="mt-10 border-t border-gray-100 pt-8">
          <SectionTitle icon={MapPin}>관련 스팟</SectionTitle>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {hankkut.relatedSpots.map((spot) => (
              <li key={spot.id}>
                <Link
                  href={`/spot?keyword=${encodeURIComponent(spot.name)}`}
                  className="group flex items-center justify-between gap-3 rounded-2xl bg-gray-50 p-4 transition-colors hover:bg-ocean-50"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-navy-900">{spot.name}</p>
                    <p className="mt-0.5 text-xs text-gray-500">
                      {spot.region} · {spot.price}
                    </p>
                  </div>
                  <ArrowUpRight className="h-4 w-4 shrink-0 text-gray-400 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ocean-600" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
