import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { useSpotMarkers } from "./useSpotMarkers";
import type { MapMarker } from "@/types/spot";

export function useFilteredMarkers(): MapMarker[] {
  const { data: markers = [] } = useSpotMarkers();
  const searchParams = useSearchParams();

  const selectedCategories = searchParams.getAll("category");

  return useMemo(() => {
    if (selectedCategories.length === 0) return markers;

    return markers.filter((m) =>
      selectedCategories.includes(m.category)  // lclsSystm1 → category
    );
  }, [markers, selectedCategories]);
}