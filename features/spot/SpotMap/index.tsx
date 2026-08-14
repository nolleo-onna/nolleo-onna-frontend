"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSpotMarkers } from "../hooks/useSpotMarkers";
import { useFilteredMarkers } from "../hooks/useFilteredMarkers";
import type { MapMarker } from "@/types/spot";
import MapSkeleton from "@/components/ui/Skeleton/MapSkeleton";
import { CATEGORY_META } from "@/features/spot/constants/categoryMap";
import { DISTRICT_COORDS } from "@/features/spot/constants/districtCoords";

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
  onSelectMarker: (id: string, placeType: "SPOT" | "FOOD") => void;
  mapInstanceRef: React.RefObject<kakao.maps.Map | null>;
}

// 기본 화면은 특정 구로 확대하지 않고 부산 전체를 구 단위 원으로 보여준다
// (DISTRICT_VIEW_MIN_LEVEL 이상이라 구 단위 뷰로 시작함). 구 하나를 고르면
// 그 구 레벨(아래 DEFAULT_ZOOM_LEVEL)로 확대된다.
const DEFAULT_CENTER = { lat: 35.1796, lng: 129.0756 };
const DEFAULT_LEVEL = 8;
// 구를 선택했을 때(필터, 구 단위 원 클릭 등) 확대해 들어가는 레벨.
const DISTRICT_ZOOM_LEVEL = 5;
// 이 레벨 이상(=많이 줌아웃돼 여러 구가 한 화면에 들어옴)에서는 개별 스팟
// 마커 대신 구 단위 원만 보여준다. 부산 전체가 한눈에 들어올 때 마커 수백
// 개가 흩어져 보이는 걸 막고, 어느 구를 볼지부터 고르게 한다.
const DISTRICT_VIEW_MIN_LEVEL = 7;

// 마커에는 구 정보가 없어서(위경도만 있음), 가장 가까운 구 중심좌표로
// 대략 묶는다 — 행정구역 경계까지 정확할 필요 없이 "대충 어느 구"만 맞으면
// 되는 개요용 집계라 이 정도 근사로 충분하다.
function nearestDistrict(spot: MapMarker): string {
  let best = "";
  let bestDistSq = Infinity;
  for (const [district, coords] of Object.entries(DISTRICT_COORDS)) {
    const dy = coords.lat - spot.mapY;
    const dx = coords.lng - spot.mapX;
    const distSq = dx * dx + dy * dy;
    if (distSq < bestDistSq) {
      bestDistSq = distSq;
      best = district;
    }
  }
  return best;
}

function groupByDistrict(spots: MapMarker[]): Map<string, number> {
  const counts = new Map<string, number>();
  spots.forEach((spot) => {
    const district = nearestDistrict(spot);
    counts.set(district, (counts.get(district) ?? 0) + 1);
  });
  return counts;
}

export default function SpotMap({ selectedId, onSelectMarker, mapInstanceRef }: SpotMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const overlaysRef = useRef<kakao.maps.CustomOverlay[]>([]);
  const markers = useFilteredMarkers();
  const { isLoading } = useSpotMarkers();

  // 지금 뭘 보고 있는지(구 이름/장소 이름) 지도 위에 잠깐 떠서 알려주는 라벨.
  // 아이콘만 있는 마커라 클릭 결과가 바로 안 보일 수 있어 추가한다.
  const [statusLabel, setStatusLabel] = useState<string | null>(null);
  const statusTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showStatus = useCallback((text: string) => {
    setStatusLabel(text);
    if (statusTimeoutRef.current) clearTimeout(statusTimeoutRef.current);
    statusTimeoutRef.current = setTimeout(() => setStatusLabel(null), 2200);
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;

    const initMap = () => {
      kakao.maps.load(() => {
        const map = new kakao.maps.Map(mapRef.current!, {
          center: new kakao.maps.LatLng(DEFAULT_CENTER.lat, DEFAULT_CENTER.lng),
          level: DEFAULT_LEVEL,
        });
        (mapInstanceRef as React.MutableRefObject<kakao.maps.Map | null>).current = map;
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
  }, [mapInstanceRef]);

  // 실제 지도 마커처럼 작은 물방울 핀 모양(위는 원, 아래는 뾰족한 꼬리)을
  // 만든다. 꼬리 끝이 실제 좌표를 가리키도록 wrapper 아래쪽에 여유 공간을
  // 두고, CustomOverlay의 yAnchor를 1(바닥 기준)로 맞춰서 쓴다.
  const pinMarkup = (color: string, emoji: string, size: number, borderPx: number) => {
    const tailPx = Math.round(size * 0.35);
    return `
      <div style="position: relative; width: ${size}px; height: ${size + tailPx}px;">
        <div style="
          position: absolute;
          top: 0;
          left: 0;
          width: ${size}px;
          height: ${size}px;
          border-radius: 50% 50% 50% 0;
          background: ${color};
          border: ${borderPx}px solid #ffffff;
          box-shadow: 0 3px 8px rgba(13,48,128,0.3), 0 1px 2px rgba(0,0,0,0.14);
          transform: rotate(-45deg);
        "></div>
        <div style="
          position: absolute;
          top: 0;
          left: 0;
          width: ${size}px;
          height: ${size}px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: ${Math.round(size * 0.5)}px;
          line-height: 1;
          pointer-events: none;
        ">${emoji}</div>
      </div>
    `;
  };

  // 구 단위 원: 많이 줌아웃됐을 때(DISTRICT_VIEW_MIN_LEVEL 이상) 개별 마커 대신
  // 보여준다. 구마다 크기가 다르면 스팟 개수 차이로 오해하기 쉬워서, 개수와
  // 무관하게 전부 같은 크기로 통일한다.
  const DISTRICT_CIRCLE_SIZE = 56;

  const renderDistrictCircle = (map: kakao.maps.Map, district: string) => {
    const coords = DISTRICT_COORDS[district];
    if (!coords) return;

    const size = DISTRICT_CIRCLE_SIZE;

    const content = document.createElement("div");
    content.innerHTML = `
      <button type="button" aria-label="${district} 확대해서 보기" style="
        all: unset;
        display: flex;
        align-items: center;
        justify-content: center;
        width: ${size}px;
        height: ${size}px;
        border-radius: 9999px;
        background: linear-gradient(140deg, #34a6ff, #0a84ff);
        border: 3px solid #ffffff;
        box-shadow: 0 6px 16px rgba(10,132,255,0.35), 0 1px 2px rgba(0,0,0,0.12);
        color: #ffffff;
        font-weight: 700;
        font-size: 12px;
        letter-spacing: -0.3px;
        white-space: nowrap;
        cursor: pointer;
        user-select: none;
        transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s ease;
      ">${district}</button>
    `;

    const el = content.firstElementChild as HTMLElement;
    el.addEventListener("pointerenter", () => {
      el.style.transform = "scale(1.08)";
      el.style.boxShadow = "0 8px 20px rgba(10,132,255,0.46), 0 1px 2px rgba(0,0,0,0.12)";
    });
    el.addEventListener("pointerleave", () => {
      el.style.transform = "scale(1)";
      el.style.boxShadow = "0 6px 16px rgba(10,132,255,0.35), 0 1px 2px rgba(0,0,0,0.12)";
    });
    el.addEventListener("click", () => {
      showStatus(`${district.replace("구", "").replace("군", "")}에서 찾는 중...`);
      map.setCenter(new kakao.maps.LatLng(coords.lat, coords.lng));
      map.setLevel(DISTRICT_ZOOM_LEVEL);
    });

    const overlay = new kakao.maps.CustomOverlay({
      position: new kakao.maps.LatLng(coords.lat, coords.lng),
      content,
      yAnchor: 0.5,
      zIndex: 2,
    });
    overlay.setMap(map);
    overlaysRef.current.push(overlay);
  };

  const renderSingle = (map: kakao.maps.Map, spot: MapMarker) => {
    const isSelected = spot.id === selectedId;
    const { color, emoji } = markerStyle(spot);
    // 너무 작으면 정확히 클릭하기 어려워서(빗나가면 지도 자체를 클릭한 걸로
    // 인식돼 기본 확대 동작만 일어남) 최소 크기를 30px 이상으로 유지한다.
    const size = isSelected ? 34 : 30;

    const content = document.createElement("div");
    content.innerHTML = `
      <button type="button" aria-label="${spot.title}" style="
        all: unset;
        display: block;
        cursor: pointer;
        transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
      ">${pinMarkup(color, emoji, size, isSelected ? 3 : 2)}</button>
    `;

    const el = content.firstElementChild as HTMLElement;
    el.addEventListener("pointerenter", () => { el.style.transform = "scale(1.15)"; });
    el.addEventListener("pointerleave", () => { el.style.transform = "scale(1)"; });
    el.addEventListener("click", () => {
      showStatus(`${nearestDistrict(spot).replace("구", "").replace("군", "")} ${spot.title}`);
      onSelectMarker(spot.id, spot.type);
    });

    const overlay = new kakao.maps.CustomOverlay({
      position: new kakao.maps.LatLng(spot.mapY, spot.mapX),
      content,
      yAnchor: 1,
      zIndex: isSelected ? 3 : 1,
    });
    overlay.setMap(map);
    overlaysRef.current.push(overlay);
  };

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const render = () => {
      overlaysRef.current.forEach((o) => o.setMap(null));
      overlaysRef.current = [];

      if (map.getLevel() >= DISTRICT_VIEW_MIN_LEVEL) {
        const counts = groupByDistrict(markers);
        counts.forEach((_count, district) => {
          renderDistrictCircle(map, district);
        });
        return;
      }

      // 클러스터로 묶지 않고 장소마다 각자의 마커/모달로 바로 연결한다 —
      // 같은 지역에 여러 곳이 몰려 있어도 목록 팝업 없이 하나하나 클릭할 수 있게.
      markers.forEach((spot) => renderSingle(map, spot));
    };

    render();

    // 줌이 바뀌면 구 단위 뷰 ↔ 마커 뷰 전환 여부를 다시 판단해야 한다.
    // (팬은 오버레이가 좌표에 붙어있어 카카오맵이 알아서 따라가므로 재계산 불필요)
    kakao.maps.event.addListener(map, "zoom_changed", render);
    return () => {
      kakao.maps.event.removeListener(map, "zoom_changed", render);
    };
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

      {/* 지금 뭘 보고 있는지 잠깐 알려주는 라벨 */}
      <div
        className={`pointer-events-none absolute left-1/2 top-4 z-20 -translate-x-1/2 transition-all duration-300 ${
          statusLabel ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0"
        }`}
      >
        {statusLabel && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/95 px-4 py-2 text-sm font-semibold text-navy-900 shadow-[0_4px_16px_rgba(13,48,128,0.2)] backdrop-blur-sm">
            {statusLabel}
          </span>
        )}
      </div>
    </section>
  );
}
