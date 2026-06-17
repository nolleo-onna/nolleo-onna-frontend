import { Suspense } from "react";
import CrowdView from "@/features/crowd/components/CrowdView";

export default function CrowdPage() {
  return (
    <Suspense fallback={null}>
      <CrowdView />
    </Suspense>
  );
}