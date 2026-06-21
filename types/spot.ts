// 공통 응답 래퍼
export interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
}

// 마커용 (경량)
export interface SpotMarker {
  contentId: string;
  contentTypeId: string;
  title: string;
  mapX: number;
  mapY: number;
  firstImage: string;
  lclsSystm1: string;
  lclsSystm2: string;
  lclsSystm3: string;
}

// 상세 조회
export interface SpotIntro {
  parking?: string;
  usetime?: string;
  restdate?: string;
}

export interface SpotImage {
  originImgUrl: string;
  smallImgUrl: string;
  imgName: string;
}

export interface SpotDetail {
  contentId: string;
  contentTypeId: string;
  title: string;
  mapX: number;
  mapY: number;
  firstImage: string;
  firstImage2: string;
  lclsSystm1: string;
  lclsSystm2: string;
  lclsSystm3: string;
  lDongRegnCd: string;
  lDongSignguCd: string;
  tel: string;
  homepage: string;
  addr1: string;
  addr2: string;
  zipcode: string;
  overview: string;
  intro: SpotIntro;
  parkingAvailable: boolean;
  images: SpotImage[];
  minPrice?: number;
  avgPrice?: number;
  representativeMenuName?: string;
  representativePrice?: number;
}

export interface SpotMarker {
  contentId: string;
  contentTypeId: string;
  title: string;
  mapX: number;
  mapY: number;
  firstImage: string;
  lclsSystm1: string;
  lclsSystm2: string;
  lclsSystm3: string;
  lDongSignguCd: string; // 추가
}