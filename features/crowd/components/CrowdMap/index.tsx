"use client";

import { useEffect, useRef } from "react";
import { useCongestion } from "@/features/home/hooks/useCongestion";
import { getDistrictSummaries } from "@/features/home/utils/congestion";
import { CROWD_STYLE } from "@/features/crowd/utils/crowdUtils";
import { DISTRICT_COORDS } from "@/features/spot/constants/districtCoords";
import MapSkeleton from "@/components/ui/Skeleton/MapSkeleton";
import type { DistrictSpotMarker } from "@/features/crowd/hooks/useDistrictSpotMarkers";

const BUSAN_CENTER = { lat: 35.1796, lng: 129.0756 };
// 부산 전체 뷰(스팟 페이지와 동일)와 구 선택 시 확대 레벨
const DEFAULT_LEVEL = 8;
const DISTRICT_LEVEL = 6;

interface CrowdMapProps {
  selectedDistrict: string | null;
  onSelectDistrict: (district: string) => void;
  /** 선택한 구의 상세 스팟 마커 (이름 매칭으로 좌표를 얻은 것만) */
  spotMarkers: DistrictSpotMarker[];
}

// 관광지별 좌표는 혼잡도 API에 없어서(이름/구/집중률만 제공), 개별 스팟이 아닌
// 구 단위 원형 마커로 표현한다 — 이미 구 중심좌표(DISTRICT_COORDS)가 있어 바로 그릴 수 있다.
export default function CrowdMap({ selectedDistrict, onSelectDistrict, spotMarkers }: CrowdMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<kakao.maps.Map | null>(null);
  const overlaysRef = useRef<kakao.maps.CustomOverlay[]>([]);
  const spotOverlaysRef = useRef<kakao.maps.CustomOverlay[]>([]);
  const { data: congestion, isLoading } = useCongestion();

  useEffect(() => {
    if (!mapRef.current) return;

    const initMap = () => {
      kakao.maps.load(() => {
        const map = new kakao.maps.Map(mapRef.current!, {
          center: new kakao.maps.LatLng(BUSAN_CENTER.lat, BUSAN_CENTER.lng),
          level: DEFAULT_LEVEL,
        });
        mapInstanceRef.current = map;
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

  // 구를 선택하면 그 구 중심으로 확대하고, 선택을 해제하면 부산 전체 뷰로 복귀
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    if (selectedDistrict) {
      const coords = DISTRICT_COORDS[selectedDistrict];
      if (!coords) return;
      map.setLevel(DISTRICT_LEVEL);
      map.panTo(new kakao.maps.LatLng(coords.lat, coords.lng));
    } else {
      map.setLevel(DEFAULT_LEVEL);
      map.panTo(new kakao.maps.LatLng(BUSAN_CENTER.lat, BUSAN_CENTER.lng));
    }
  }, [selectedDistrict]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !congestion) return;

    overlaysRef.current.forEach((o) => o.setMap(null));
    overlaysRef.current = [];

    getDistrictSummaries(congestion).forEach((summary) => {
      const coords = DISTRICT_COORDS[summary.district];
      if (!coords) return;

      const style = CROWD_STYLE[summary.level];
      const isSelected = summary.district === selectedDistrict;
      const size = isSelected ? 64 : 54;

      const content = document.createElement("div");
      content.innerHTML = `
        <div style="
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: ${size}px;
          height: ${size}px;
          border-radius: 9999px;
          background: ${style.bg};
          color: ${style.text};
          border: ${isSelected ? "3px" : "2px"} solid white;
          box-shadow: 0 2px 10px rgba(0,0,0,0.25);
          cursor: pointer;
          font-weight: 700;
          user-select: none;
        ">
          <span style="font-size: 11px; opacity: 0.85;">${summary.district}</span>
          <span style="font-size: 13px;">${Math.round(summary.rate)}%</span>
        </div>
      `;
      content.addEventListener("click", () => onSelectDistrict(summary.district));

      const overlay = new kakao.maps.CustomOverlay({
        position: new kakao.maps.LatLng(coords.lat, coords.lng),
        content,
        yAnchor: 0.5,
      });
      overlay.setMap(map);
      overlaysRef.current.push(overlay);
    });
  }, [congestion, selectedDistrict, onSelectDistrict]);

  // 구 선택 시 그 구의 상세 스팟 마커(작은 칩)를 그린다
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    spotOverlaysRef.current.forEach((o) => o.setMap(null));
    spotOverlaysRef.current = [];
    if (!selectedDistrict || spotMarkers.length === 0) return;

    spotMarkers.forEach((marker) => {
      const style = CROWD_STYLE[marker.level];
      const content = document.createElement("div");
      content.innerHTML = `
        <div style="
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 4px 9px 4px 6px;
          border-radius: 9999px;
          background: rgba(255,255,255,0.95);
          border: 1.5px solid ${style.bg};
          box-shadow: 0 2px 8px rgba(0,0,0,0.18);
          font-weight: 600;
          font-size: 11px;
          color: #191919;
          white-space: nowrap;
          user-select: none;
        ">
          <span style="width: 8px; height: 8px; border-radius: 9999px; background: ${style.bg};"></span>
          ${marker.name}
          <span style="color: ${style.bg}; font-weight: 700;">${Math.round(marker.rate)}%</span>
        </div>
      `;

      const overlay = new kakao.maps.CustomOverlay({
        position: new kakao.maps.LatLng(marker.lat, marker.lng),
        content,
        yAnchor: 1.1,
        zIndex: 10,
      });
      overlay.setMap(map);
      spotOverlaysRef.current.push(overlay);
    });

    // 강서구·기장군처럼 넓은 구는 고정 확대 레벨로는 마커가 화면 밖에 잘리므로,
    // 마커가 2개 이상이면 전체가 들어오게 지도 범위를 자동으로 맞춘다
    // (1개일 때 setBounds를 쓰면 과하게 확대돼 구 레벨 뷰를 유지한다)
    if (spotMarkers.length >= 2) {
      const bounds = new kakao.maps.LatLngBounds();
      spotMarkers.forEach((marker) =>
        bounds.extend(new kakao.maps.LatLng(marker.lat, marker.lng))
      );
      map.setBounds(bounds, 60, 60, 60, 60);
    }
  }, [selectedDistrict, spotMarkers]);

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
