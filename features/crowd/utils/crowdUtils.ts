import type { CrowdLevel } from "@/types/crowd";

export function getCrowdLevel(rate: number): CrowdLevel {
  if (rate >= 70) return "매우혼잡";
  if (rate >= 50) return "혼잡";
  if (rate >= 30) return "보통";
  return "여유";
}

export const CROWD_STYLE: Record<CrowdLevel, { label: string; bg: string; text: string }> = {
  매우혼잡: { label: "매우혼잡", bg: "bg-red-500", text: "text-white" },
  혼잡:   { label: "혼잡",   bg: "bg-orange-400", text: "text-white" },
  보통:   { label: "보통",   bg: "bg-yellow-400", text: "text-white" },
  여유:   { label: "여유",   bg: "bg-green-400",  text: "text-white" },
};