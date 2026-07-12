import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { useSpotMarkers } from "./useSpotMarkers";
import type { SpotMarker } from "@/types/spot";

export function useFilteredMarkers(): SpotMarker[] {
  const { data: markers = [] } = useSpotMarkers();
  const searchParams = useSearchParams();

  const selectedCategories = searchParams.getAll("category");

  return useMemo(() => {
    if (selectedCategories.length === 0) return markers;

    return markers.filter((m) =>
      selectedCategories.includes(m.lclsSystm1)
    );
  }, [markers, selectedCategories]);
}