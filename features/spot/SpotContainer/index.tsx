"use client";

import { useRef, useState } from "react";
import SpotFilterSidebar from "../SpotFilterSidebar";
import SpotMap from "../SpotMap";
import SpotListSidebar from "../SpotListSidebar";
import SpotDetailModal from "../components/SpotDetailModal";

export default function SpotContainer() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [modalId, setModalId] = useState<string | null>(null);
  const mapRef = useRef<kakao.maps.Map | null>(null);

  const handleSelectSpot = (id: string, lat: number, lng: number) => {
    setSelectedId(id);
    setModalId(id); // 모달 열기
    if (mapRef.current) {
      mapRef.current.panTo(new kakao.maps.LatLng(lat, lng));
      mapRef.current.setLevel(4);
    }
  };

  return (
    <main className="flex h-[calc(100vh-64px)] mt-16 w-full overflow-hidden">
      <SpotFilterSidebar />
      <SpotMap
        selectedId={selectedId}
        onSelectMarker={(id) => {
          setSelectedId(id);
          setModalId(id); // 지도 핀 클릭도 모달 열기
        }}
        mapInstanceRef={mapRef}
      />
      <SpotListSidebar
        selectedId={selectedId}
        onSelectSpot={handleSelectSpot}
      />

      {/* 상세 모달 */}
      <SpotDetailModal
        contentId={modalId}
        onClose={() => setModalId(null)}
      />
    </main>
  );
}