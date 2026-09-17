import type { CourseStartArea } from "@/constants/course";

export interface AreaGuide {
  area: CourseStartArea;
  emoji?: string;
  /** 한 줄 소개 — 이 동네에서 뭘 하는지 */
  tagline?: string;
}

export interface AreaGroup {
  title: string;
  /** 대표 동네는 카드로 크게, 구 단위는 칩으로 작게 */
  variant: "card" | "chip";
  areas: AreaGuide[];
}

/**
 * 지역 고르기 판 구성 — 코스 API가 받는 18개 지역(COURSE_START_AREAS)을 빠짐없이 나눈다.
 */
export const AREA_GROUPS: AreaGroup[] = [
  {
    title: "바다 보러",
    variant: "card",
    areas: [
      { area: "광안리", emoji: "🌊", tagline: "해수욕장 · 횟집 골목" },
      { area: "송도", emoji: "🚠", tagline: "케이블카 · 구름산책로" },
      { area: "영도", emoji: "⚓", tagline: "흰여울길 · 태종대" },
      { area: "기장", emoji: "🚗", tagline: "해안 드라이브 · 등대" },
    ],
  },
  {
    title: "도심에서",
    variant: "card",
    areas: [
      { area: "서면", emoji: "🛍️", tagline: "먹자골목 · 쇼핑" },
      { area: "전포", emoji: "☕", tagline: "전포카페거리" },
      { area: "남포", emoji: "🎬", tagline: "BIFF광장 · 국제시장" },
      { area: "센텀", emoji: "🏙️", tagline: "미술관 · 영화의전당" },
      { area: "동래", emoji: "♨️", tagline: "온천천 · 동래읍성" },
    ],
  },
  {
    title: "구 단위로 넓게",
    variant: "chip",
    areas: [
      { area: "해운대" },
      { area: "중구" },
      { area: "부산진구" },
      { area: "수영구" },
      { area: "연제구" },
      { area: "북구" },
      { area: "사하구" },
      { area: "강서구" },
      { area: "사상" },
    ],
  },
];
