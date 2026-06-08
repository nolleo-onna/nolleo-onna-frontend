"use client";

import { Map } from "react-kakao-maps-sdk";

export default function SpotMap() {
	return (
		<Map
			center={{ lat: 35.1796, lng: 129.0756 }} // 부산 중심 좌표
			style={{ width: "100%", height: "100%" }}
			level={8} // 줌 레벨 (숫자 클수록 넓게)
		/>
	);
}
