"use client";

import { useEffect, useRef, useState } from "react";
import { MapPin } from "lucide-react";

interface EventLocationMapProps {
  lat: number;
  lng: number;
  /** 핀 옆에 붙는 장소 이름 */
  label: string;
}

// 카카오 SDK는 /event 레이아웃이 불러온다. 이 시간 안에 안 뜨면(키 도메인 미등록·네트워크 등) 안내로 바꾼다.
const SDK_WAIT_MS = 6000;

/** 행사 위치 한 점을 보여주는 작은 지도 */
export default function EventLocationMap({ lat, lng, label }: EventLocationMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<"loading" | "ready" | "failed">("loading");

  useEffect(() => {
    let cancelled = false;

    const init = () => {
      window.kakao.maps.load(() => {
        if (cancelled || !containerRef.current) return;
        const position = new window.kakao.maps.LatLng(lat, lng);
        const map = new window.kakao.maps.Map(containerRef.current, { center: position, level: 4 });

        const pin = document.createElement("div");
        pin.className =
          "flex items-center gap-1.5 rounded-full bg-navy-900 py-1.5 pl-2 pr-3 text-xs font-bold text-white shadow-lg";
        const dot = document.createElement("span");
        dot.className = "h-2 w-2 shrink-0 rounded-full bg-lime-300";
        const text = document.createElement("span");
        text.className = "max-w-[180px] truncate";
        text.textContent = label;
        pin.append(dot, text);

        new window.kakao.maps.CustomOverlay({ position, content: pin, yAnchor: 1.3, zIndex: 2 }).setMap(map);
        setState("ready");
      });
    };

    if (window.kakao?.maps) {
      init();
      return () => {
        cancelled = true;
      };
    }

    const startedAt = Date.now();
    const pollId = setInterval(() => {
      if (window.kakao?.maps) {
        clearInterval(pollId);
        init();
      } else if (Date.now() - startedAt > SDK_WAIT_MS) {
        clearInterval(pollId);
        setState("failed");
      }
    }, 150);

    return () => {
      cancelled = true;
      clearInterval(pollId);
    };
  }, [lat, lng, label]);

  return (
    <div className="relative h-full w-full overflow-hidden">
      <div ref={containerRef} className="h-full w-full" />
      {state !== "ready" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-ocean-50 via-white to-lime-50 text-center">
          <MapPin className={`h-6 w-6 text-ocean-500 ${state === "loading" ? "animate-bounce" : ""}`} />
          <p className="text-xs text-gray-500">
            {state === "failed" ? "지도를 불러오지 못했어요" : "지도를 불러오는 중이에요"}
          </p>
        </div>
      )}
    </div>
  );
}
