import type { CrowdLevel } from "@/types/crowd";

export function getCrowdLevel(rate: number): CrowdLevel {
  if (rate >= 70) return "매우혼잡";
  if (rate >= 50) return "혼잡";
  if (rate >= 30) return "보통";
  return "여유";
}

// 데이터 시각화 상태 팔레트(critical/serious/warning/good) — 색상만으로 구분하지
// 않도록 label과 항상 함께 쓴다. bg/text는 인라인 style로 적용하는 raw hex.
// 밝은 배경(fab219, ec835a)은 흰 글자 대비가 부족해 어두운 잉크(#0b0b0b)를 쓴다.
export const CROWD_STYLE: Record<CrowdLevel, { label: string; bg: string; text: string }> = {
  매우혼잡: { label: "매우혼잡", bg: "#d03b3b", text: "#ffffff" },
  혼잡:   { label: "혼잡",   bg: "#ec835a", text: "#0b0b0b" },
  보통:   { label: "보통",   bg: "#fab219", text: "#0b0b0b" },
  여유:   { label: "여유",   bg: "#0ca30c", text: "#ffffff" },
};