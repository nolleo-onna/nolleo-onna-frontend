/**
 * Redis에 캐싱되는 혼잡도 정보. (GET /api/v1/congestion)
 * district 파라미터가 없으면 부산 전체 구 배열, 있으면 해당 구만 반환.
 */
export interface Congestion {
  /** 구 이름 (예: 해운대구) */
  districtName: string;
  /** 구 내 관광지 평균 집중률 (%) */
  rate: number;
  /** 기준일자 (yyyyMMdd) */
  baseYmd: string;
  /** 구 내 관광지별 집중률 목록 */
  attractions: CongestionAttraction[];
}

/**
 * 구 내 관광지별 집중률.
 * ※ 백엔드 실제 필드명이 다르면 features/home/utils/congestion.ts 의
 *    flattenCongestionSpots 매핑만 수정하면 됩니다.
 */
export interface CongestionAttraction {
  /** 관광지명 */
  attractionName: string;
  /** 집중률 (%) */
  rate: number;
  /** 대표 이미지 URL (백엔드가 TourAPI firstImage 등을 내려주면 사용). 없으면 기본 이미지 */
  imageUrl?: string;
}
