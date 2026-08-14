import { Suspense } from "react";
import SpotContainer from "@/features/spot/SpotContainer";
import MapSkeleton from "@/components/ui/Skeleton/MapSkeleton";

function SpotPageSkeleton() {
  return (
    <div className="mt-16 flex h-[calc(100vh-64px)] w-full flex-col overflow-hidden">
      <div className="h-14 shrink-0 border-b border-gray-100 bg-white" />
      <main className="flex flex-1 overflow-hidden">
        <div className="hidden w-[280px] shrink-0 border-r border-gray-100 bg-white lg:block" />
        <div className="flex-1">
          <MapSkeleton />
        </div>
        <div className="hidden w-[360px] shrink-0 border-l border-gray-100 bg-white lg:block" />
      </main>
    </div>
  );
}

export default function SpotPage() {
  return (
    <Suspense fallback={<SpotPageSkeleton />}>
      <SpotContainer />
    </Suspense>
  );
}