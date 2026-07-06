export type CrowdLevel = "매우혼잡" | "혼잡" | "보통" | "여유";

// GET /api/v1/congestion 원본 응답: 구별로 묶여서 오고, 구 안에 관광지별 배열이 중첩됨
export type CongestionAttraction = {
  name: string;
  rate: number;
};

export type CongestionDistrict = {
  district: string;
  rate: number; // 구 전체 평균 혼잡도
  baseYmd: string;
  attractions: CongestionAttraction[];
};

// 프론트에서 쓰기 좋게 관광지 단위로 평탄화한 형태 (기존 CrowdSpot 대체)
export type CrowdSpot = {
  name: string;
  district: string;
  rate: number;
  baseYmd: string;
};
