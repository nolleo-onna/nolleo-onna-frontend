import type { Metadata } from "next";

import GalleryGrid from "@/features/hankkut/components/GalleryGrid";
import HubHero from "@/features/hankkut/components/HubHero";

export const metadata: Metadata = {
  title: "한끗 | 놀러온나",
};

export default function HankkutPage() {
  return (
    <div className="pt-16">
      <HubHero />
      <div className="mx-auto w-full max-w-[1280px] px-5 pb-16 pt-10 md:px-10 md:pt-14 lg:px-20">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-2">
          <h2 className="text-2xl font-bold tracking-tight text-navy-900">동네 고르기</h2>
          <p className="text-sm text-gray-500">가장 많이 찾는 동네부터 보여드려요</p>
        </div>
        <GalleryGrid />
      </div>
    </div>
  );
}
