import { Suspense } from "react";
import CrowdView from "@/features/crowd/components/CrowdView";
import MapSkeleton from "@/components/ui/Skeleton/MapSkeleton";

function CrowdPageSkeleton() {
  return (
    <div className="flex h-screen pt-16">
      <aside className="hidden w-[360px] shrink-0 flex-col border-r border-gray-100 bg-white lg:flex" />
      <div className="flex-1">
        <MapSkeleton />
      </div>
    </div>
  );
}

export default function CrowdPage() {
  return (
    <Suspense fallback={<CrowdPageSkeleton />}>
      <CrowdView />
    </Suspense>
  );
}