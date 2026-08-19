export interface FavoriteItem {
  mapPlaceId: number;
  name: string;
  district: string;
  category: string;
  latitude: number;
  longitude: number;
  favoritedAt: string;
}

export interface FavoritePageResponse {
  content: FavoriteItem[];
  totalElements: number;
  totalPages: number;
  number: number;
  last: boolean;
}

export interface FavoriteToggleResponse {
  mapPlaceId: number;
  favorited: boolean;
}

export interface FavoriteStatusResponse {
  mapPlaceId: number;
  favorited: boolean;
}
