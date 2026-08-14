"use client";

import { useEffect, useRef, useState } from "react";

import type { CoursePlace } from "@/features/course/data/mockCourse";

interface CourseMapProps {
  places: CoursePlace[];
  selectedPlaceId: number | null;
  onSelectPlace: (place: CoursePlace) => void;
}

export default function CourseMap({
  places,
  selectedPlaceId,
  onSelectPlace,
}: CourseMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<kakao.maps.Map | null>(null);
  const overlaysRef = useRef<kakao.maps.CustomOverlay[]>([]);
  const polylineRef = useRef<kakao.maps.Polyline | null>(null);
  const [mapReady, setMapReady] = useState(false);  // ← 초기화 완료 신호

  // 지도 초기화 (SDK 로드 이벤트 대기)
  useEffect(() => {
    if (!containerRef.current) return;

    const initMap = () => {
      window.kakao.maps.load(() => {
        if (!containerRef.current) return;
        mapRef.current = new window.kakao.maps.Map(containerRef.current, {
          center: new window.kakao.maps.LatLng(35.1532, 129.1186),
          level: 5,
        });
        setMapReady(true);  // ← 지도 준비 완료 → 마커 effect 트리거
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
  }, []);

  // 마커 + 폴리라인 갱신 — mapReady 포함으로 초기 렌더 시에도 실행
  useEffect(() => {
    const map = mapRef.current;
    if (!map || places.length === 0) return;

    // 기존 오버레이 제거
    overlaysRef.current.forEach((overlay) => overlay.setMap(null));
    overlaysRef.current = [];
    polylineRef.current?.setMap(null);

    const bounds = new window.kakao.maps.LatLngBounds();

    places.forEach((place, index) => {
      const position = new window.kakao.maps.LatLng(place.lat, place.lng);
      bounds.extend(position);

      const isSelected = place.id === selectedPlaceId;
      const content = document.createElement("button");
      content.type = "button";
      content.className = [
        "flex h-8 w-8 items-center justify-center rounded-full",
        "text-sm font-bold text-white shadow-md transition-transform",
        isSelected ? "bg-ocean-500 scale-125" : "bg-navy-900 hover:scale-110",
      ].join(" ");
      content.textContent = String(index + 1);
      content.addEventListener("click", () => onSelectPlace(place));

      const overlay = new window.kakao.maps.CustomOverlay({
        position,
        content,
        yAnchor: 0.5,
        zIndex: isSelected ? 10 : 1,
      });
      overlay.setMap(map);
      overlaysRef.current.push(overlay);
    });

    polylineRef.current = new window.kakao.maps.Polyline({
      path: places.map((p) => new window.kakao.maps.LatLng(p.lat, p.lng)),
      strokeWeight: 2,
      strokeColor: "#1B2A4A",
      strokeOpacity: 0.8,
      strokeStyle: "shortdash",
    });
    polylineRef.current.setMap(map);

    map.setBounds(bounds, 80, 80, 200, 80);
  }, [places, selectedPlaceId, onSelectPlace, mapReady]);  // ← mapReady 추가

  // 선택 장소로 이동
  useEffect(() => {
    const map = mapRef.current;
    const selected = places.find((p) => p.id === selectedPlaceId);
    if (!map || !selected) return;

    map.panTo(new window.kakao.maps.LatLng(selected.lat, selected.lng));
  }, [places, selectedPlaceId]);

  return <div ref={containerRef} className="h-full w-full" />;
}