// 찜(즐겨찾기) 관련 타입.
// 백엔드 FavoriteItemResponse는 mapPlaceId·name·district·category·latitude·longitude·favoritedAt만 준다
// (placeType·originalId·imageUrl 없음). 화면 공통 모양으로 맞추기 위해 없는 필드는 null로 채우며,
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
