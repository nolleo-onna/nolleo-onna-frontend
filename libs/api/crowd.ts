import { clientFetch } from "@/libs/clientFetch";
import type { ApiResponse } from "@/types/course";
import type { CrowdSpot } from "@/types/crowd";

export async function fetchCrowd(): Promise<CrowdSpot[]> {
  const res = await clientFetch("/api/v1/crowd");
  const json: ApiResponse<CrowdSpot[]> = await res.json();
  return json.data;
}