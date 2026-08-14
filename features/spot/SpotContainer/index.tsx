"use client";

import { useRef, useState } from "react";
import dynamic from "next/dynamic";
import { SlidersHorizontal, List, X } from "lucide-react";
import SpotFilterSidebar from "../SpotFilterSidebar";
import SpotListSidebar from "../SpotListSidebar";
import SpotDetailModal from "../components/SpotDetailModal";
import SpotStatusBar from "../components/SpotStatusBar";
import { DISTRICT_COORDS } from "@/features/spot/constants/districtCoords";
import MapSkeleton from "@/components/ui/Skeleton/MapSkeleton";

const SpotMap = dynamic(() => import("../SpotMap"), {
  ssr: false,
  loading: () => <MapSkeleton />,
});

export default function SpotContainer() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [modalInfo, setModalInfo] = useState<{
    id: string;
    placeType: "SPOT" | "FOOD";
    mapPlaceId: number;
  } | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isListOpen, setIsListOpen] = useState(false);
  const mapRef = useRef<kakao.maps.Map | null>(null);

  const handleSelectSpot = (
    id: string,
    lat: number,
    lng: number,
    placeType: "SPOT" | "FOOD",
    mapPlaceId: number
  ) => {
    setSelectedId(id);
    setModalInfo({ id, placeType, mapPlaceId });
    if (mapRef.current) {
      mapRef.current.panTo(new kakao.maps.LatLng(lat, lng));
      mapRef.current.setLevel(4);
    }
  };

  const handleSelectRegion = (region: string | null) => {
    setIsFilterOpen(false);
    if (!mapRef.current) return;
    if (!region) {
      // 전체 선택 시 부산 전체로 줌아웃
      mapRef.current.setCenter(new kakao.maps.LatLng(35.1796, 129.0756));
      mapRef.current.setLevel(8);
      return;
    }
    const coords = DISTRICT_COORDS[region];
    if (!coords) return;
    mapRef.current.setCenter(new kakao.maps.LatLng(coords.lat, coords.lng));
    mapRef.current.setLevel(5);
  };

  return (
    <div className="mt-16 flex h-[calc(100vh-64px)] w-full flex-col overflow-hidden">
      <SpotStatusBar />
      <main className="relative flex flex-1 overflow-hidden">
        {/* 모바일 필터/목록 열림 시 배경 딤 처리 */}
        {(isFilterOpen || isListOpen) && (
          <div
            className="fixed inset-0 z-30 bg-black/30 lg:hidden"
            onClick={() => {
              setIsFilterOpen(false);
              setIsListOpen(false);
            }}
          />
        )}

        {/* 필터 사이드바: lg 미만에서는 슬라이드오버로 전환 */}
        <div
          className={`fixed top-16 bottom-0 left-0 z-40 flex w-[280px] transition-transform duration-300 lg:static lg:z-auto lg:h-full lg:translate-x-0 ${
            isFilterOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <button
            type="button"
            onClick={() => setIsFilterOpen(false)}
            aria-label="필터 닫기"
            className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-md lg:hidden"
          >
            <X className="h-4 w-4 text-gray-600" />
          </button>
          <SpotFilterSidebar onSelectRegion={handleSelectRegion} />
        </div>

        <SpotMap
          selectedId={selectedId}
          onSelectMarker={(id) => {
            setSelectedId(id);
            setModalInfo({ id, placeType: "SPOT", mapPlaceId: 0 }); // mapPlaceId: 0 문제 남아있음
          }}
          mapInstanceRef={mapRef}
        />

        {/* 리스트 사이드바: lg 미만에서는 슬라이드오버로 전환 */}
        <div
          className={`fixed top-16 bottom-0 right-0 z-40 flex transition-transform duration-300 lg:static lg:z-auto lg:h-full lg:translate-x-0 ${
            isListOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <button
            type="button"
            onClick={() => setIsListOpen(false)}
            aria-label="목록 닫기"
            className="absolute left-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-md lg:hidden"
          >
            <X className="h-4 w-4 text-gray-600" />
          </button>
          <SpotListSidebar
            selectedId={selectedId}
            onSelectSpot={(...args) => {
              setIsListOpen(false);
              handleSelectSpot(...args);
            }}
          />
        </div>

        <SpotDetailModal
          contentId={modalInfo?.id ?? null}
          placeType={modalInfo?.placeType ?? null}
          mapPlaceId={modalInfo?.mapPlaceId ?? null}
          onClose={() => setModalInfo(null)}
        />

        {/* 모바일 전용 필터/목록 토글 버튼 */}
        <div className="fixed bottom-5 left-1/2 z-40 flex -translate-x-1/2 gap-2 lg:hidden">
          <button
            type="button"
            onClick={() => {
              setIsListOpen(false);
              setIsFilterOpen(true);
            }}
            className="flex items-center gap-1.5 rounded-full bg-navy-900 px-4 py-2.5 text-sm font-semibold text-white shadow-lg"
          >
            <SlidersHorizontal className="h-4 w-4" />
            필터
          </button>
          <button
            type="button"
            onClick={() => {
              setIsFilterOpen(false);
              setIsListOpen(true);
            }}
            className="flex items-center gap-1.5 rounded-full bg-navy-900 px-4 py-2.5 text-sm font-semibold text-white shadow-lg"
          >
            <List className="h-4 w-4" />
            목록
          </button>
        </div>
      </main>
    </div>
  );
}