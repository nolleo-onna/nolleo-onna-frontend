export interface MapPlace {
  id: number;
  placeType: "SPOT" | "FOOD";
  originalId: string;
  name: string;
  district: string;
  category: "FD" | "VE" | "NA" | "HS" | "EX" | "LS";
  longitude: number;
  latitude: number;
  imageUrl: string | null;
  minPrice: number | null;
  free: boolean;
  avgRating: number;
  reviewCount: number;
}

export interface MapPlacePage {
  content: MapPlace[];
  totalElements: number;
  totalPages: number;
  last: boolean;
  numberOfElements: number;
}

export interface MapPlacesParams {
  district?: string;
  category?: string;
  maxBudget?: number;
  /** 장소명 부분 일치 검색 (서버) */
  keyword?: string;
  page?: number;
  size?: number;
  sort?: string;
}