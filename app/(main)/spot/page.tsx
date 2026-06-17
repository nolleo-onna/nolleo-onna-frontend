import { Suspense } from "react";
import SpotContainer from "@/features/spot/SpotContainer";

export default function SpotPage() {
  return (
    <Suspense fallback={null}>
      <SpotContainer />
    </Suspense>
  );
}