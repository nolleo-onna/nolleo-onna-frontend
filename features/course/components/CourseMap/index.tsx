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

    // 지도 컴포넌트가 dynamic import로 지연 마운트되면 이 시점에 카카오 SDK
    // <script> 태그가 아직 DOM에 삽입되기 전일 수 있다 — 태그가 나타날 때까지
    // 짧게 재확인한 뒤 load 이벤트를 붙인다.
    let attachedScript: HTMLScriptElement | null = null;
    let pollId: ReturnType<typeof setInterval> | null = null;

    const tryAttach = () => {
      const script = document.querySelector(
        'script[src*="dapi.kakao.com"]'
      ) as HTMLScriptElement | null;
      if (!script) return false;
      attachedScript = script;
      script.addEventListener("load", initMap);
      return true;
    };

    if (!tryAttach()) {
      pollId = setInterval(() => {
        if (tryAttach() && pollId) clearInterval(pollId);
      }, 100);
    }

    return () => {
      if (pollId) clearInterval(pollId);
      attachedScript?.removeEventListener("load", initMap);
    };
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

    // 하단 200px 여백은 데스크톱의 큰 상세 카드용 — 지도 높이가 42vh뿐인
    // 모바일에서 그대로 쓰면 마커 영역이 위쪽으로 압축돼 과하게 줌아웃된다.
    // 컨테이너 실제 높이 기준으로 여백을 조정하고, 레이아웃(모바일 스택 등)
    // 변경 직후 컨테이너 크기가 달라졌을 수 있어 relayout으로 재계산한다.
    const fitBounds = () => {
      map.relayout();
      const height = containerRef.current?.clientHeight ?? 0;
      if (height < 500) {
        map.setBounds(bounds, 40, 40, 110, 40);
      } else {
        map.setBounds(bounds, 80, 80, 200, 80);
      }
    };
    fitBounds();

    // 화면 회전·창 크기 변경 시에도 코스 전체가 계속 화면에 들어오게 유지
    window.addEventListener("resize", fitBounds);
    return () => window.removeEventListener("resize", fitBounds);
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