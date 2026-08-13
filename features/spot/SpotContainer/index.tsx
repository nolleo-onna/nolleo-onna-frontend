"use client";

import { useRef, useState } from "react";
import SpotFilterSidebar from "../SpotFilterSidebar";
import SpotMap from "../SpotMap";
import SpotListSidebar from "../SpotListSidebar";
import SpotDetailModal from "../components/SpotDetailModal";
import SpotStatusBar from "../components/SpotStatusBar";
import { DISTRICT_COORDS } from "@/features/spot/constants/districtCoords";

export default function SpotContainer() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [modalInfo, setModalInfo] = useState<{
    id: string;
    placeType: "SPOT" | "FOOD";
    mapPlaceId: number;
  } | null>(null);
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
      <main className="flex flex-1 overflow-hidden">
        <SpotFilterSidebar onSelectRegion={handleSelectRegion} />
        <SpotMap
          selectedId={selectedId}
          onSelectMarker={(id) => {
            setSelectedId(id);
            setModalInfo({ id, placeType: "SPOT", mapPlaceId: 0 }); // mapPlaceId: 0 문제 남아있음
          }}
          mapInstanceRef={mapRef}
        />
        <SpotListSidebar
          selectedId={selectedId}
          onSelectSpot={handleSelectSpot}
        />
        <SpotDetailModal
          contentId={modalInfo?.id ?? null}
          placeType={modalInfo?.placeType ?? null}
          mapPlaceId={modalInfo?.mapPlaceId ?? null}
          onClose={() => setModalInfo(null)}
        />
      </main>
    </div>
  );
}