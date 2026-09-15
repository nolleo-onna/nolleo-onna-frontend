import type { FavoritePlace } from "@/types/favorite";
import type { MapPlace } from "@/types/map";

/**
 * 찜 목록 API는 사진을 주지 않아, 장소명으로 지도 장소를 검색한 결과에서 사진을 고른다.
 * 같은 id(mapPlaceId)를 먼저 찾고, 없으면 이름이 똑같은 장소를 쓴다. http 사진은 https로 바꾼다.
 */
export function findFavoriteImage(
  places: Pick<MapPlace, "id" | "name" | "imageUrl">[] | undefined,
  favorite: Pick<FavoritePlace, "mapPlaceId" | "name">,
): string | null {
  if (!places || places.length === 0) return null;
  const match =
    places.find((place) => place.id === favorite.mapPlaceId) ??
    places.find((place) => place.name.trim() === favorite.name.trim());
  return match?.imageUrl ? match.imageUrl.replace(/^http:\/\//, "https://") : null;
}
