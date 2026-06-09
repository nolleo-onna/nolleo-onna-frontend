"use client";

import { useEffect, useRef } from "react";

export default function SpotMap() {
	const mapRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const initMap = () => {
			if (!mapRef.current) return;
			const options = {
				center: new window.kakao.maps.LatLng(35.1796, 129.0756),
				level: 8,
			};
			new window.kakao.maps.Map(mapRef.current, options);
		};

		const loadMap = () => {
			window.kakao.maps.load(initMap);
		};

		if (window.kakao?.maps) {
			loadMap();
		} else {
			// 스크립트가 아직 로드 안 됐으면 일정 간격으로 체크
			const interval = setInterval(() => {
				if (window.kakao?.maps) {
					clearInterval(interval);
					loadMap();
				}
			}, 100);

			return () => clearInterval(interval);
		}
	}, []);

	return <div ref={mapRef} className="h-full w-full" />;
}
