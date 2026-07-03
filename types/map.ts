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
  page?: number;
  size?: number;
  sort?: string;
}