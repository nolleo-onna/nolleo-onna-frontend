"use client";

import { useEffect, useRef } from "react";
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

// 전체 부산을 다 보여주면 클러스터가 잔뜩 보여서 정신없다 — 가장 널리
// 찾는 해운대구를 기본 화면으로 보여주고, 필터에서 "전체"를 고르면 그때
// 전체 지도로 줌아웃한다.
const DEFAULT_CENTER = DISTRICT_COORDS["해운대구"];
const DEFAULT_LEVEL = 5;
// 클러스터 중심 사이 최소 화면 픽셀 간격. 줌 레벨과 무관하게 "화면상 이만큼
// 가까우면 겹친다"는 기준이 고정이라 어느 줌에서나 자연스럽게 뭉치고 풀린다.
const CLUSTER_RADIUS_PX = 64;
// 이 레벨 이상(=많이 줌아웃돼 여러 구가 한 화면에 들어옴)에서는 개별 스팟
// 마커/클러스터 대신 구 단위 원만 보여준다. 부산 전체가 한눈에 들어올 때
// 클러스터 수십 개가 흩어져 보이는 걸 막고, 어느 구를 볼지부터 고르게 한다.
const DISTRICT_VIEW_MIN_LEVEL = 7;

interface Cluster {
  x: number;
  y: number;
  members: MapMarker[];
}

// 격자로 나눠서 묶으면 바로 옆 칸에 있는 클러스터끼리도 서로 다닥다닥 붙어
// 그려진다(칸 경계 문제). 대신 각 마커를 "반경 안에 있는 기존 클러스터 중
// 가장 가까운 곳"에 그리디하게 합쳐서, 클러스터 중심끼리 최소 반경만큼은
// 항상 떨어져 있도록 만든다 — 결과적으로 원 개수 자체가 훨씬 줄어든다.
function clusterMarkers(map: kakao.maps.Map, spots: MapMarker[]): Cluster[] {
  const proj = map.getProjection();
  const radiusSq = CLUSTER_RADIUS_PX * CLUSTER_RADIUS_PX;
  const clusters: Cluster[] = [];

  spots.forEach((spot) => {
    const point = proj.pointFromCoords(new kakao.maps.LatLng(spot.mapY, spot.mapX));

    let nearest: Cluster | null = null;
    let nearestDistSq = radiusSq;
    for (const cluster of clusters) {
      const dx = cluster.x - point.x;
      const dy = cluster.y - point.y;
      const distSq = dx * dx + dy * dy;
      if (distSq <= nearestDistSq) {
        nearest = cluster;
        nearestDistSq = distSq;
      }
    }

    if (nearest) {
      const n = nearest.members.length + 1;
      nearest.x = (nearest.x * (n - 1) + point.x) / n;
      nearest.y = (nearest.y * (n - 1) + point.y) / n;
      nearest.members.push(spot);
    } else {
      clusters.push({ x: point.x, y: point.y, members: [spot] });
    }
  });

  return clusters;
}

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

  // 클러스터 배지: 여러 카테고리가 섞여있을 수 있어 카테고리색 대신 브랜드 그라디언트로,
  // "여기 더 있다"는 느낌을 명확히 구분한다.
  const renderCluster = (map: kakao.maps.Map, cluster: Cluster) => {
    const proj = map.getProjection();
    const position = proj.coordsFromPoint(new kakao.maps.Point(cluster.x, cluster.y));
    const count = cluster.members.length;
    // 숫자 없이 크기만으로 밀도를 전달해야 해서, 작은 클러스터와 큰 클러스터의
    // 크기 차이를 이전보다 더 뚜렷하게 벌린다.
    const size = Math.round(Math.min(30 + Math.sqrt(count) * 8, 72));

    const content = document.createElement("div");
    content.innerHTML = `
      <button type="button" aria-label="${count}개 스팟 확대해서 보기" style="
        all: unset;
        display: flex;
        align-items: center;
        justify-content: center;
        width: ${size}px;
        height: ${size}px;
        border-radius: 9999px;
        background: linear-gradient(140deg, #34a6ff, #0a84ff);
        border: 3px solid #ffffff;
        box-shadow: 0 6px 16px rgba(10,132,255,0.38), 0 1px 2px rgba(0,0,0,0.12);
        cursor: pointer;
        transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s ease;
      "></button>
    `;

    const el = content.firstElementChild as HTMLElement;
    el.addEventListener("pointerenter", () => {
      el.style.transform = "scale(1.08)";
      el.style.boxShadow = "0 8px 20px rgba(10,132,255,0.46), 0 1px 2px rgba(0,0,0,0.12)";
    });
    el.addEventListener("pointerleave", () => {
      el.style.transform = "scale(1)";
      el.style.boxShadow = "0 6px 16px rgba(10,132,255,0.38), 0 1px 2px rgba(0,0,0,0.12)";
    });
    el.addEventListener("click", () => {
      map.setLevel(Math.max(map.getLevel() - 2, 1), { anchor: position });
    });

    const overlay = new kakao.maps.CustomOverlay({
      position,
      content,
      yAnchor: 0.5,
      zIndex: 2,
    });
    overlay.setMap(map);
    overlaysRef.current.push(overlay);
  };

  // 구 단위 원: 많이 줌아웃됐을 때(DISTRICT_VIEW_MIN_LEVEL 이상) 개별 마커 대신
  // 보여준다. 스팟 개수 없이 구 이름과 상대적 크기만으로 "어디에 많은지"를 전달한다.
  const renderDistrictCircle = (
    map: kakao.maps.Map,
    district: string,
    count: number,
    maxCount: number
  ) => {
    const coords = DISTRICT_COORDS[district];
    if (!coords) return;

    const ratio = count / maxCount;
    const size = Math.round(44 + ratio * 28);
    const shortName = district.replace("구", "").replace("군", "");

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
        font-size: 13px;
        cursor: pointer;
        user-select: none;
        transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s ease;
      ">${shortName}</button>
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
      map.setCenter(new kakao.maps.LatLng(coords.lat, coords.lng));
      map.setLevel(DEFAULT_LEVEL);
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
    const size = isSelected ? 40 : 32;

    const content = document.createElement("div");
    content.innerHTML = `
      <button type="button" aria-label="${spot.title}" style="
        all: unset;
        display: flex;
        align-items: center;
        justify-content: center;
        width: ${size}px;
        height: ${size}px;
        border-radius: 9999px;
        background: ${color};
        border: ${isSelected ? "3px" : "2.5px"} solid #ffffff;
        box-shadow: 0 3px 10px rgba(13,48,128,0.28), 0 1px 2px rgba(0,0,0,0.14);
        cursor: pointer;
        font-size: ${isSelected ? "17px" : "14px"};
        line-height: 1;
        transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
      ">${emoji}</button>
    `;

    const el = content.firstElementChild as HTMLElement;
    el.addEventListener("pointerenter", () => { el.style.transform = "scale(1.12)"; });
    el.addEventListener("pointerleave", () => { el.style.transform = "scale(1)"; });
    el.addEventListener("click", () => onSelectMarker(spot.id, spot.type));

    const overlay = new kakao.maps.CustomOverlay({
      position: new kakao.maps.LatLng(spot.mapY, spot.mapX),
      content,
      yAnchor: 0.5,
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
        const maxCount = Math.max(1, ...counts.values());
        counts.forEach((count, district) => {
          renderDistrictCircle(map, district, count, maxCount);
        });
        return;
      }

      clusterMarkers(map, markers).forEach((cluster) => {
        if (cluster.members.length === 1) {
          renderSingle(map, cluster.members[0]);
        } else {
          renderCluster(map, cluster);
        }
      });
    };

    render();

    // 줌이 바뀌면 화면 픽셀 밀도가 달라져 클러스터 묶음이 다시 계산돼야 하고,
    // 구 단위 뷰 ↔ 마커 뷰 전환 여부도 다시 판단해야 한다.
    // (팬은 오버레이가 좌표에 붙어있어 카카오맵이 알아서 따라가므로 재계산 불필요)
    kakao.maps.event.addListener(map, "zoom_changed", render);
    return () => kakao.maps.event.removeListener(map, "zoom_changed", render);
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
