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
        <div className="mb-4 flex items-center gap-2">
          <MapPin className="h-5 w-5 text-ocean-500" />
          <h2 className="text-lg font-bold text-navy-900">동네 고르기</h2>
        </div>
        <GalleryGrid />
      </div>
    </div>
  );
}
