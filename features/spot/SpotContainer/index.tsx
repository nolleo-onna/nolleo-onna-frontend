"use client";

import { useRef, useState } from "react";
import SpotFilterSidebar from "../SpotFilterSidebar";
import SpotMap from "../SpotMap";
import SpotListSidebar from "../SpotListSidebar";

export default function SpotContainer() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const mapRef = useRef<kakao.maps.Map | null>(null);

  const handleSelectSpot = (id: string, lat: number, lng: number) => {
    setSelectedId(id);
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
        onSelectMarker={setSelectedId}
        mapInstanceRef={mapRef}
      />
      <SpotListSidebar
        selectedId={selectedId}
        onSelectSpot={handleSelectSpot}
      />
    </main>
  );
}
