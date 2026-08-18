export const CATEGORY_CODE_MAP: Record<string, string[]> = {
  FD: ["FD"],
  NA: ["NA"],
  VE: ["VE"],
  HS: ["HS"],
  EX: ["EX"],
  LS: ["LS"],
};

// 카테고리 코드별 라벨/이모지/마커 색상 — 필터 UI와 지도 마커가 같은 값을 공유한다.
export const CATEGORY_META: Record<
  "NA" | "VE" | "HS" | "EX" | "LS" | "FD",
  { label: string; emoji: string; color: string }
> = {
  NA: { label: "자연 · 해변", emoji: "🌊", color: "#0ea5e9" },
  VE: { label: "관광 · 문화", emoji: "🏛️", color: "#0a84ff" },
  HS: { label: "역사 · 문화유산", emoji: "🏯", color: "#8b5cf6" },
  EX: { label: "체험 · 액티비티", emoji: "🎢", color: "#ef4444" },
  LS: { label: "레저스포츠", emoji: "🏄", color: "#10b981" },
  FD: { label: "맛집 · 카페", emoji: "🍽️", color: "#f59e0b" },
};

export const CATEGORIES = (
  ["NA", "VE", "HS", "EX", "LS", "FD"] as const
).map((id) => ({ id, ...CATEGORY_META[id] }));
