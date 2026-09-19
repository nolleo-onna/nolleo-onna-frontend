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

/**
 * 지도 색을 "오늘 부산 안에서의 상대 비교"로 칠하기 위한 등급.
 * 절대 기준(70/50/30)으로는 실제 값이 늘 50~90%에 몰려 지도가 빨강·주황만 되고
 * 초록이 한 번도 안 나온다. 그래서 지도 색만 그날 값을 줄 세워 네 단계로 나눈다.
 * 숫자(%)와 "매우혼잡" 같은 라벨은 절대 기준(CROWD_STYLE) 그대로 쓴다.
 */
export type CrowdTier = 0 | 1 | 2 | 3;

export const CROWD_TIER_STYLE: Record<CrowdTier, { color: string; label: string }> = {
  0: { color: "#0ca30c", label: "덜 붐빔" },
  1: { color: "#8fb511", label: "보통" },
  2: { color: "#ec835a", label: "붐빔" },
  3: { color: "#d03b3b", label: "많이 붐빔" },
};

/**
 * 집중률이 낮은 쪽부터 줄 세워 등급을 매긴다. 순위를 0~3에 비례로 펴므로
 * 구가 몇 개든 가장 한산한 곳은 0(초록), 가장 붐비는 곳은 3(빨강)이 된다.
 */
export function getCrowdTiers(
  districts: { district: string; rate: number }[],
): Record<string, CrowdTier> {
  const ordered = [...districts].sort((a, b) => a.rate - b.rate);
  const last = ordered.length - 1;
  return Object.fromEntries(
    ordered.map((d, index) => [
      d.district,
      (last <= 0 ? 0 : Math.round((index / last) * 3)) as CrowdTier,
    ]),
  );
}

// 혼잡도 API의 기준 일자(baseYmd, "YYYYMMDD")를 "8월 19일" 형태로 변환.
// 형식이 예상과 다르면 null을 돌려 표시 자체를 생략한다(잘못된 날짜 노출 방지).
export function formatBaseYmd(baseYmd: string): string | null {
  if (!/^\d{8}$/.test(baseYmd)) return null;
  const month = Number(baseYmd.slice(4, 6));
  const day = Number(baseYmd.slice(6, 8));
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  return `${month}월 ${day}일`;
}