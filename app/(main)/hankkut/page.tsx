import type { Metadata } from "next";
import { MapPin } from "lucide-react";

import GalleryGrid from "@/features/hankkut/components/GalleryGrid";

export const metadata: Metadata = {
  title: "한끗 | 놀러온나",
};

export default function HankkutPage() {
  return (
    <div className="pt-16">
      <div className="mx-auto w-full max-w-[1280px] px-5 py-8 md:px-10 lg:px-20">
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-ocean-50 via-white to-lime-50 px-6 py-10 md:px-12 md:py-12">
          <p className="text-sm font-semibold text-ocean-600">
            동네마다 다른 부산 여행 정보
          </p>
          <h1 className="mt-2 text-4xl font-bold text-navy-900 md:text-5xl">
            우리{" "}
            <span className="relative inline-block">
              <span
                aria-hidden
                className="absolute inset-x-0 bottom-1 -z-10 h-4 rounded-sm bg-lime-300"
              />
              한끗
            </span>
          </h1>
          <p className="mt-3 max-w-md text-sm text-gray-600">
            동네를 고르면 그 동네만의 한끗이 열려요. 이번 주 인기글도 보고,
            직접 글도 남겨보세요.
          </p>
        </section>

        <div className="mt-10">
          <div className="mb-4 flex items-center gap-2">
            <MapPin className="h-5 w-5 text-ocean-500" />
            <h2 className="text-lg font-bold text-navy-900">동네 고르기</h2>
          </div>
          <GalleryGrid />
        </div>
      </div>
    </div>
  );
}
