"use client";

import { useEffect, useRef } from "react";
import { useSpotMarkers } from "../hooks/useSpotMarkers";
import { useFilteredMarkers } from "../hooks/useFilteredMarkers";
import type { SpotMarker } from "@/types/spot";

interface SpotMapProps {
  selectedId: string | null;
  onSelectMarker: (id: string) => void;
  mapInstanceRef: React.RefObject<kakao.maps.Map | null>;
}

const BUSAN_CENTER = { lat: 35.1796, lng: 129.0756 };
const DEFAULT_ZOOM = 8;

export default function SpotMap({ selectedId, onSelectMarker, mapInstanceRef }: SpotMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const overlaysRef = useRef<kakao.maps.CustomOverlay[]>([]);
  const markers = useFilteredMarkers();
  const { isLoading } = useSpotMarkers();

  // 지도 초기화
  useEffect(() => {
    if (!mapRef.current) return;

    const initMap = () => {
      kakao.maps.load(() => {
        const map = new kakao.maps.Map(mapRef.current!, {
          center: new kakao.maps.LatLng(BUSAN_CENTER.lat, BUSAN_CENTER.lng),
          level: DEFAULT_ZOOM,
        });
        (mapInstanceRef as React.MutableRefObject<kakao.maps.Map | null>).current = map;
      });
    };

    if (window.kakao?.maps) {
      initMap();
      return;
    }

    const script = document.querySelector(
      'script[src*="dapi.kakao.com"]'
    ) as HTMLScriptElement | null;

    if (script) {
      script.addEventListener("load", initMap);
      return () => script.removeEventListener("load", initMap);
    }
  }, [mapInstanceRef]);

  // 마커 렌더링
  useEffect(() => {
    if (!mapInstanceRef.current || markers.length === 0) return;

    overlaysRef.current.forEach((o) => o.setMap(null));
    overlaysRef.current = [];

    markers.forEach((spot: SpotMarker) => {
      const isSelected = spot.contentId === selectedId;
      const content = document.createElement("div");

      content.innerHTML = `
        <div style="
          display: flex;
          flex-direction: column;
          align-items: center;
          cursor: pointer;
        ">
          <svg width="${isSelected ? "24" : "20"}" height="${isSelected ? "30" : "24"}" viewBox="0 0 20 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 0C4.5 0 0 4.5 0 10c0 7.5 10 14 10 14s10-6.5 10-14C20 4.5 15.5 0 10 0z"
              fill="${isSelected ? "#ff4d8f" : "#0d3080"}"/>
            <circle cx="10" cy="10" r="4" fill="white"/>
          </svg>
        </div>
      `;

      content.addEventListener("click", () => onSelectMarker(spot.contentId));

      const overlay = new kakao.maps.CustomOverlay({
        position: new kakao.maps.LatLng(spot.mapY, spot.mapX),
        content,
        yAnchor: 0.5,
      });
      overlay.setMap(mapInstanceRef.current!);
      overlaysRef.current.push(overlay);
    });
  }, [markers, selectedId, onSelectMarker, mapInstanceRef]);

  return (
    <section className="relative flex-1">
      {isLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-gray-100">
          <span className="text-sm text-gray-500">지도 불러오는 중...</span>
        </div>
      )}
      <div ref={mapRef} className="h-full w-full" />
    </section>
  );
}
