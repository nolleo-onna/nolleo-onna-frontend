import { clientFetch } from "@/libs/clientFetch";
import type { ApiResponse } from "@/types/spot";
import type { MapPlacePage, MapPlacesParams } from "@/types/map";

const buildParams = (p: MapPlacesParams): string => {
  const sp = new URLSearchParams();
  if (p.district) sp.set("district", p.district);
  if (p.category) sp.set("category", p.category);
  if (p.maxBudget !== undefined) sp.set("maxBudget", String(p.maxBudget));
  if (p.sort) sp.set("sort", p.sort);
  sp.set("page", String(p.page ?? 0));
  sp.set("size", String(p.size ?? 20));
  return sp.toString();
};

export const fetchMapPlaces = async (params: MapPlacesParams = {}): Promise<MapPlacePage> => {
  const res = await clientFetch(`/api/v1/map/places?${buildParams(params)}`);
  const json: ApiResponse<MapPlacePage> = await res.json();
  return json.data;
};