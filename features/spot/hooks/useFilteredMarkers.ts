// features/spot/hooks/useFilteredMarkers.ts
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { useSpotMarkers } from "./useSpotMarkers";
import { CATEGORY_CODE_MAP } from "../constants/categoryMap";
import type { SpotMarker } from "@/types/spot";

export function useFilteredMarkers(): SpotMarker[] {
  const { data: markers = [] } = useSpotMarkers();
  const searchParams = useSearchParams();

  const selectedCategories = searchParams.getAll("category");

  return useMemo(() => {
    if (selectedCategories.length === 0) return markers;

    const allowedCodes = selectedCategories.flatMap(
      (cat) => CATEGORY_CODE_MAP[cat] ?? []
    );
    return markers.filter((m) => allowedCodes.includes(m.lclsSystm2));
  }, [markers, selectedCategories]);
}