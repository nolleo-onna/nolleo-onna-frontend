"use client";

import { useEffect, useRef } from "react";
import { useSpotMarkers } from "../hooks/useSpotMarkers";
import { useFilteredMarkers } from "../hooks/useFilteredMarkers";
import type { MapMarker } from "@/types/spot";
import MapSkeleton from "@/components/ui/Skeleton/MapSkeleton";
import { CATEGORY_META } from "@/features/spot/constants/categoryMap";

const FOOD_COLOR = CATEGORY_META.FD.color;
const FOOD_EMOJI = CATEGORY_META.FD.emoji;

function markerStyle(spot: MapMarker) {
  const meta = CATEGORY_META[spot.category as keyof typeof CATEGORY_META];
  if (meta) return meta;
  // FOOD 타입은 category 코드가 없거나 다를 수 있어 type으로 한 번 더 폴백
  if (spot.type === "FOOD") return { color: FOOD_COLOR, emoji: FOOD_EMOJI, label: "음식점" };
  return { color: "#0d3080", emoji: "📍", label: "기타" };
}

interface SpotMapProps {
  selectedId: string | null;
  onSelectMarker: (id: string) => void;
  mapInstanceRef: React.RefObject<kakao.maps.Map | null>;
}

const BUSAN_CENTER = { lat: 35.1796, lng: 129.0756 };
const CLUSTER_ZOOM_THRESHOLD = 7;

const DISTRICT_CLUSTERS: {
  name: string;
  lat: number;
  lng: number;
  color: string;
}[] = [
  { name: "해운대구", lat: 35.1631, lng: 129.1635, color: "#4F86F7" },
  { name: "수영구",   lat: 35.1453, lng: 129.1133, color: "#7C6FF7" },
  { name: "남구",     lat: 35.1367, lng: 129.0844, color: "#F76F6F" },
  { name: "동구",     lat: 35.1296, lng: 129.0456, color: "#F7A94F" },
  { name: "중구",     lat: 35.1059, lng: 129.0325, color: "#F76FA9" },
  { name: "서구",     lat: 35.0977, lng: 129.0241, color: "#4FC5F7" },
  { name: "사하구",   lat: 35.1045, lng: 128.9745, color: "#6FF7A0" },
  { name: "강서구",   lat: 35.2121, lng: 128.9803, color: "#F7E04F" },
  { name: "북구",     lat: 35.1974, lng: 128.9904, color: "#A04FF7" },
  { name: "사상구",   lat: 35.1524, lng: 128.9921, color: "#F7974F" },
  { name: "부산진구", lat: 35.1630, lng: 129.0530, color: "#4FF7D4" },
  { name: "동래구",   lat: 35.1996, lng: 129.0837, color: "#F74F4F" },
  { name: "연제구",   lat: 35.1762, lng: 129.0806, color: "#4FF779" },
  { name: "금정구",   lat: 35.2429, lng: 129.0927, color: "#F7C84F" },
  { name: "기장군",   lat: 35.2446, lng: 129.2224, color: "#4F97F7" },
  { name: "영도구",   lat: 35.0912, lng: 129.0706, color: "#F74FAA" },
];

export default function SpotMap({ selectedId, onSelectMarker, mapInstanceRef }: SpotMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const overlaysRef = useRef<kakao.maps.CustomOverlay[]>([]);
  const clusterOverlaysRef = useRef<kakao.maps.CustomOverlay[]>([]);
  const markers = useFilteredMarkers();
  const { isLoading } = useSpotMarkers();

  useEffect(() => {
    if (!mapRef.current) return;

    const initMap = () => {
      kakao.maps.load(() => {
        const map = new kakao.maps.Map(mapRef.current!, {
          center: new kakao.maps.LatLng(BUSAN_CENTER.lat, BUSAN_CENTER.lng),
          level: 8,
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

  // 클러스터 오버레이 그리기
  const renderClusters = (map: kakao.maps.Map, spots: MapMarker[]) => {
    clusterOverlaysRef.current.forEach((o) => o.setMap(null));
    clusterOverlaysRef.current = [];

    DISTRICT_CLUSTERS.forEach((district) => {
      const count = spots.length > 0
        ? Math.floor(spots.length / DISTRICT_CLUSTERS.length)
        : 0;

      const content = document.createElement("div");
      content.innerHTML = `
        <div style="
          display: flex;
          flex-direction: column;
          align-items: center;
          cursor: pointer;
          user-select: none;
        ">
          <div style="
            width: 52px;
            height: 52px;
            border-radius: 50%;
            background: ${district.color};
            border: 3px solid white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.25);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: 700;
            font-size: 13px;
            line-height: 1.2;
          ">
            <span style="font-size: 11px; font-weight: 600; opacity: 0.9;">${district.name.replace("구","").replace("군","")}</span>
            <span style="font-size: 12px;">${count}</span>
          </div>
        </div>
      `;

      content.addEventListener("click", () => {
        map.setCenter(new kakao.maps.LatLng(district.lat, district.lng));
        map.setLevel(5);
      });

      const overlay = new kakao.maps.CustomOverlay({
        position: new kakao.maps.LatLng(district.lat, district.lng),
        content,
        yAnchor: 0.5,
        zIndex: 1,
      });
      overlay.setMap(map);
      clusterOverlaysRef.current.push(overlay);
    });
  };

  // 개별 마커 그리기
  const renderMarkers = (map: kakao.maps.Map, spots: MapMarker[]) => {
    overlaysRef.current.forEach((o) => o.setMap(null));
    overlaysRef.current = [];

    spots.forEach((spot: MapMarker) => {
      const isSelected = spot.id === selectedId;
      const { color, emoji } = markerStyle(spot);
      const content = document.createElement("div");

      // 카테고리별 색상 + 이모지로 클릭 전에도 무슨 장소인지 구분되게 한다.
      // 선택 상태는 색을 바꾸는 대신 크기와 흰 테두리로 표시해 카테고리 색을 유지한다.
      const width = isSelected ? 28 : 24;
      const height = width * 1.2;
      const emojiSize = isSelected ? 15 : 13;
      const emojiTop = height * (10 / 24);

      content.innerHTML = `
        <div style="
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          cursor: pointer;
        ">
          <svg width="${width}" height="${height}" viewBox="0 0 20 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 0C4.5 0 0 4.5 0 10c0 7.5 10 14 10 14s10-6.5 10-14C20 4.5 15.5 0 10 0z"
              fill="${color}" stroke="${isSelected ? "#ffffff" : "none"}" stroke-width="${isSelected ? 1.5 : 0}"/>
            <circle cx="10" cy="10" r="6" fill="white"/>
          </svg>
          <span style="
            position: absolute;
            top: ${emojiTop}px;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: ${emojiSize}px;
            line-height: 1;
            pointer-events: none;
          ">${emoji}</span>
        </div>
      `;

      content.addEventListener("click", () => onSelectMarker(spot.id));

      const overlay = new kakao.maps.CustomOverlay({
        position: new kakao.maps.LatLng(spot.mapY, spot.mapX),
        content,
        yAnchor: 0.5,
      });
      overlay.setMap(map);
      overlaysRef.current.push(overlay);
    });
  };

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || markers.length === 0) return;

    const update = () => {
      const level = map.getLevel();
      if (level >= CLUSTER_ZOOM_THRESHOLD) {
        overlaysRef.current.forEach((o) => o.setMap(null));
        overlaysRef.current = [];
        renderClusters(map, markers);
      } else {
        clusterOverlaysRef.current.forEach((o) => o.setMap(null));
        clusterOverlaysRef.current = [];
        renderMarkers(map, markers);
      }
    };

    update();

    kakao.maps.event.addListener(map, "zoom_changed", update);
    return () => kakao.maps.event.removeListener(map, "zoom_changed", update);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [markers, selectedId, mapInstanceRef]);

  return (
    <section className="relative flex-1">
      {isLoading && (
        <div className="absolute inset-0 z-10">
          <MapSkeleton />
        </div>
      )}
      <div ref={mapRef} className="h-full w-full" />
    </section>
  );
}