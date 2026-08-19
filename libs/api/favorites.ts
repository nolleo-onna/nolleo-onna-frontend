import { clientFetch } from "@/libs/clientFetch";

import type { ApiResponse } from "@/types/spot";
import type { FavoritePlace } from "@/types/favorite";

// 백엔드 찜 API의 정확한 응답 스키마를 아직 확인하지 못해(인증 필요),
// 이 파일에서 방어적으로 파싱해 FavoritePlace로 정규화한다.
// 스키마가 확정되면 이 파일만 고치면 된다.

const asRecord = (value: unknown): Record<string, unknown> | null =>
  typeof value === "object" && value !== null
    ? (value as Record<string, unknown>)
    : null;

const asNumber = (value: unknown): number | null =>
  typeof value === "number" && Number.isFinite(value) ? value : null;

const asString = (value: unknown): string | null =>
  typeof value === "string" && value.length > 0 ? value : null;

function normalizeFavorite(raw: unknown): FavoritePlace | null {
  const record = asRecord(raw);
  if (!record) return null;

  // 아이템이 { mapPlace: {...} } 형태로 중첩돼 올 가능성도 대비한다.
  const place = asRecord(record.mapPlace) ?? asRecord(record.place) ?? record;

  const mapPlaceId =
    asNumber(record.mapPlaceId) ?? asNumber(place.mapPlaceId) ?? asNumber(place.id);
  if (mapPlaceId === null || mapPlaceId <= 0) return null;

  const placeTypeRaw = asString(place.placeType);

  return {
    mapPlaceId,
    name: asString(place.name) ?? asString(place.title) ?? "이름 없는 장소",
    placeType:
      placeTypeRaw === "SPOT" || placeTypeRaw === "FOOD" ? placeTypeRaw : null,
    originalId: asString(place.originalId),
    district: asString(place.district),
    category: asString(place.category),
    imageUrl: asString(place.imageUrl),
  };
}

// data가 boolean 그대로이거나 { favorited: true } 같은 래핑일 수 있어 모두 대응한다.
function extractFavoriteFlag(data: unknown): boolean | null {
  if (typeof data === "boolean") return data;
  const record = asRecord(data);
  if (!record) return null;
  const candidateKeys = ["favorited", "isFavorite", "isFavorited", "favorite", "liked"];
  for (const key of candidateKeys) {
    if (typeof record[key] === "boolean") return record[key] as boolean;
  }
  return null;
}

// 찜한 장소 목록 조회
export async function fetchFavorites(): Promise<FavoritePlace[]> {
  const res = await clientFetch("/api/v1/favorites");
  if (!res.ok) throw new Error("찜 목록을 불러오지 못했어요");

  const json: ApiResponse<unknown> = await res.json();
  const record = asRecord(json.data);
  // data가 배열 그대로이거나, 페이지네이션({ content: [...] }) 래핑일 수 있다.
  const rawItems = Array.isArray(json.data)
    ? json.data
    : Array.isArray(record?.content)
      ? record.content
      : Array.isArray(record?.favorites)
        ? record.favorites
        : [];

  return rawItems
    .map(normalizeFavorite)
    .filter((item): item is FavoritePlace => item !== null);
}

// 찜 토글. 토글 후 찜 상태를 알려주면 boolean, 아니면 null 반환.
export async function toggleFavorite(mapPlaceId: number): Promise<boolean | null> {
  const res = await clientFetch(`/api/v1/favorites/${mapPlaceId}/toggle`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("찜 상태를 변경하지 못했어요");

  const json = (await res.json().catch(() => null)) as ApiResponse<unknown> | null;
  return extractFavoriteFlag(json?.data);
}

// 특정 장소의 찜 여부 조회
export async function fetchFavoriteStatus(mapPlaceId: number): Promise<boolean> {
  const res = await clientFetch(`/api/v1/favorites/${mapPlaceId}/status`);
  if (!res.ok) throw new Error("찜 여부를 확인하지 못했어요");

  const json: ApiResponse<unknown> = await res.json();
  return extractFavoriteFlag(json.data) ?? false;
}
