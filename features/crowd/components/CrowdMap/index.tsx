"use client";

import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
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
  /** 상세 스팟 칩 마커 클릭 시 (장소 상세 모달 열기) */
  onSelectSpot: (marker: DistrictSpotMarker) => void;
  selectedDistrict: string | null;
  onSelectDistrict: (district: string) => void;
  /** 선택한 구의 상세 스팟 마커 (이름 매칭으로 좌표를 얻은 것만) */
  spotMarkers: DistrictSpotMarker[];
}

// 구별 행정구역 경계 폴리곤 (public/data, [lng, lat] 링 배열 — 섬이 있는 구는 링 여러 개)
type DistrictPaths = Record<string, [number, number][][]>;

// 구 경계를 혼잡도 등급색 폴리곤으로 칠하고, 중심에 구 이름·집중률 라벨을 띄운다.
// 경계 데이터 로드 전이나 실패 시에는 기존 원형 마커로 폴백한다.
export default function CrowdMap({ selectedDistrict, onSelectDistrict, onSelectSpot, spotMarkers }: CrowdMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<kakao.maps.Map | null>(null);
  const overlaysRef = useRef<kakao.maps.CustomOverlay[]>([]);
  const polygonsRef = useRef<kakao.maps.Polygon[]>([]);
  const spotOverlaysRef = useRef<kakao.maps.CustomOverlay[]>([]);
  const { data: congestion, isLoading } = useCongestion();

  const { data: districtPaths } = useQuery<DistrictPaths>({
    queryKey: ["busanDistrictPolygons"],
    queryFn: async () => {
      const res = await fetch("/data/busan-districts.json");
      if (!res.ok) throw new Error("Failed to load district polygons");
      return res.json();
    },
    staleTime: Infinity,
  });

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
    polygonsRef.current.forEach((p) => p.setMap(null));
    polygonsRef.current = [];

    getDistrictSummaries(congestion).forEach((summary) => {
      const coords = DISTRICT_COORDS[summary.district];
      if (!coords) return;

      const style = CROWD_STYLE[summary.level];
      const isSelected = summary.district === selectedDistrict;
      const rings = districtPaths?.[summary.district];

      if (rings?.length) {
        // 구 경계 폴리곤 — 혼잡도 등급색으로 채운다
        const baseFill = isSelected ? 0.42 : 0.2;
        const polygon = new kakao.maps.Polygon({
          path: rings.map((ring) =>
            ring.map(([lng, lat]) => new kakao.maps.LatLng(lat, lng))
          ),
          strokeWeight: isSelected ? 2.5 : 1.5,
          strokeColor: style.bg,
          strokeOpacity: 0.9,
          fillColor: style.bg,
          fillOpacity: baseFill,
        });
        polygon.setMap(map);
        kakao.maps.event.addListener(polygon, "click", () =>
          onSelectDistrict(summary.district)
        );
        kakao.maps.event.addListener(polygon, "mouseover", () =>
          polygon.setOptions({ fillOpacity: 0.4 })
        );
        kakao.maps.event.addListener(polygon, "mouseout", () =>
          polygon.setOptions({ fillOpacity: baseFill })
        );
        polygonsRef.current.push(polygon);
      }

      const content = document.createElement("div");
      if (rings?.length) {
        // 폴리곤이 색을 담당하므로 라벨은 작은 알약 형태로
        content.innerHTML = `
          <div style="
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 0;
            padding: 4px 10px;
            border-radius: 9999px;
            background: rgba(255,255,255,0.95);
            border: ${isSelected ? "2px" : "1.5px"} solid ${style.bg};
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            cursor: pointer;
            user-select: none;
            line-height: 1.25;
          ">
            <span style="font-size: 11px; font-weight: 700; color: #191919;">${summary.district}</span>
            <span style="font-size: 12px; font-weight: 800; color: ${style.bg};">${Math.round(summary.rate)}%</span>
          </div>
        `;
      } else {
        // 경계 데이터가 없을 때의 폴백: 기존 원형 마커
        const size = isSelected ? 64 : 54;
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
      }
      content.addEventListener("click", () => onSelectDistrict(summary.district));

      const overlay = new kakao.maps.CustomOverlay({
        position: new kakao.maps.LatLng(coords.lat, coords.lng),
        content,
        yAnchor: 0.5,
      });
      overlay.setMap(map);
      overlaysRef.current.push(overlay);
    });

    // 혼잡도 API가 데이터를 안 주는 구(금정·남·동·서구 등)는 지도에 구멍처럼
    // 보이지 않게 회색 "정보 없음" 폴리곤으로 채운다. 클릭하면 패널이 열려
    // 스팟 보러가기·코스 만들기 링크는 그대로 쓸 수 있다.
    if (districtPaths) {
      const covered = new Set(getDistrictSummaries(congestion).map((s) => s.district));
      const NO_DATA_COLOR = "#9ca3af";

      Object.entries(districtPaths).forEach(([district, rings]) => {
        if (covered.has(district) || !rings.length) return;
        const coords = DISTRICT_COORDS[district];
        if (!coords) return;

        const isSelected = district === selectedDistrict;
        const polygon = new kakao.maps.Polygon({
          path: rings.map((ring) =>
            ring.map(([lng, lat]) => new kakao.maps.LatLng(lat, lng))
          ),
          strokeWeight: isSelected ? 2 : 1,
          strokeColor: NO_DATA_COLOR,
          strokeOpacity: 0.7,
          fillColor: NO_DATA_COLOR,
          fillOpacity: isSelected ? 0.22 : 0.1,
        });
        polygon.setMap(map);
        kakao.maps.event.addListener(polygon, "click", () =>
          onSelectDistrict(district)
        );
        polygonsRef.current.push(polygon);

        const content = document.createElement("div");
        content.innerHTML = `
          <div style="
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 4px 10px;
            border-radius: 9999px;
            background: rgba(255,255,255,0.9);
            border: ${isSelected ? "2px" : "1.5px"} solid ${NO_DATA_COLOR};
            box-shadow: 0 2px 8px rgba(0,0,0,0.15);
            cursor: pointer;
            user-select: none;
            line-height: 1.25;
          ">
            <span style="font-size: 11px; font-weight: 700; color: #6b7280;">${district}</span>
            <span style="font-size: 10px; font-weight: 600; color: #9ca3af;">정보 없음</span>
          </div>
        `;
        content.addEventListener("click", () => onSelectDistrict(district));

        const overlay = new kakao.maps.CustomOverlay({
          position: new kakao.maps.LatLng(coords.lat, coords.lng),
          content,
          yAnchor: 0.5,
        });
        overlay.setMap(map);
        overlaysRef.current.push(overlay);
      });
    }
  }, [congestion, selectedDistrict, onSelectDistrict, districtPaths]);

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
          cursor: pointer;
        ">
          <span style="width: 8px; height: 8px; border-radius: 9999px; background: ${style.bg};"></span>
          ${marker.name}
          <span style="color: ${style.bg}; font-weight: 700;">${Math.round(marker.rate)}%</span>
        </div>
      `;
      content.addEventListener("click", () => onSelectSpot(marker));

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
  }, [selectedDistrict, spotMarkers, onSelectSpot]);

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
