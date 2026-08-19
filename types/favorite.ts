// 찜(즐겨찾기) 관련 타입.
// 백엔드 응답 스키마가 아직 문서화되지 않아, 목록 아이템은
// MapPlace(types/map.ts)와 유사하다고 가정하고 필드 누락에 안전하게 정의한다.
// 정규화는 libs/api/favorites.ts에서 한 번만 수행한다.
export interface FavoritePlace {
  mapPlaceId: number;
  name: string;
  placeType: "SPOT" | "FOOD" | null;
  originalId: string | null;
  district: string | null;
  category: string | null;
  imageUrl: string | null;
}
