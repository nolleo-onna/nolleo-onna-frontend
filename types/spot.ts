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
  firstImage: string | null;
  lclsSystm1: string;
  lclsSystm2: string;
  lclsSystm3: string;
  lDongSignguCd: string;
}

// 상세 조회
export interface SpotIntro {
  parking?: string;
  usetime?: string;
  restdate?: string;
  infocenter?: string;
  chkbabycarriage?: string;
  chkpet?: string;
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
  firstImage: string | null;
  firstImage2: string | null;
  lclsSystm1: string;
  lclsSystm2: string;
  lclsSystm3: string;
  lDongRegnCd: string;
  lDongSignguCd: string;
  tel: string | null;
  homepage: string | null;
  addr1: string;
  addr2: string | null;
  zipcode: string;
  overview: string;
  intro: SpotIntro;
  parkingAvailable: boolean | null;
  images: SpotImage[];
  minPrice?: number | null;
  avgPrice?: number | null;
  representativeMenuName?: string | null;
  representativePrice?: number | null;
}

// 음식점 상세
export interface FoodMenu {
  menuName: string;
  price: number | null;
  representative: boolean;
}

export interface FoodDetail {
  id: number;
  name: string;
  normalizedCategory: string;
  address: string;
  tel: string | null;
  description: string | null;
  representativeMenu: string | null;
  businessHoursRaw: string | null;
  deliveryAvailable: boolean | null;
  parkingAvailable: boolean | null;
  district: string;
  mapX: number;
  mapY: number;
  menus: FoodMenu[];
}

export interface MapMarker {
  type: "SPOT" | "FOOD";
  id: string;
  title: string;
  mapX: number;
  mapY: number;
  firstImage: string | null;
  category: string;
}