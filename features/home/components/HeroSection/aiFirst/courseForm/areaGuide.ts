import type { CourseStartArea } from "@/constants/course";

export interface AreaGuide {
  area: CourseStartArea;
  emoji?: string;
  /** 한 줄 소개 — 이 동네에서 뭘 하는지 */
  tagline?: string;
  /** 장소 목록 API(district)로 이 동네 장소를 부를 때 쓰는 구·군 */
  district: string;
}

export interface AreaGroup {
  title: string;
  /** 대표 동네는 카드로 크게, 구 단위는 칩으로 작게 */
  variant: "card" | "chip";
  areas: AreaGuide[];
}

/**
 * 지역 고르기 판 구성 — 코스 API가 받는 18개 지역(COURSE_START_AREAS)을 빠짐없이 나눈다.
 * district는 스팟 장소 데이터의 구·군 이름과 같아야 한다 (예: 센텀·해운대 → 해운대구).
 */
export const AREA_GROUPS: AreaGroup[] = [
  {
    title: "바다 보러",
    variant: "card",
    areas: [
      { area: "광안리", emoji: "🌊", tagline: "해수욕장 · 횟집 골목", district: "수영구" },
      { area: "송도", emoji: "🚠", tagline: "케이블카 · 구름산책로", district: "서구" },
      { area: "영도", emoji: "⚓", tagline: "흰여울길 · 태종대", district: "영도구" },
      { area: "기장", emoji: "🚗", tagline: "해안 드라이브 · 등대", district: "기장군" },
    ],
  },
  {
    title: "도심에서",
    variant: "card",
    areas: [
      { area: "서면", emoji: "🛍️", tagline: "먹자골목 · 쇼핑", district: "부산진구" },
      { area: "전포", emoji: "☕", tagline: "전포카페거리", district: "부산진구" },
      { area: "남포", emoji: "🎬", tagline: "BIFF광장 · 국제시장", district: "중구" },
      { area: "센텀", emoji: "🏙️", tagline: "미술관 · 영화의전당", district: "해운대구" },
      { area: "동래", emoji: "♨️", tagline: "온천천 · 동래읍성", district: "동래구" },
    ],
  },
  {
    title: "구 단위로 넓게",
    variant: "chip",
    areas: [
      { area: "해운대", district: "해운대구" },
      { area: "중구", district: "중구" },
      { area: "부산진구", district: "부산진구" },
      { area: "수영구", district: "수영구" },
      { area: "연제구", district: "연제구" },
      { area: "북구", district: "북구" },
      { area: "사하구", district: "사하구" },
      { area: "강서구", district: "강서구" },
      { area: "사상", district: "사상구" },
    ],
  },
];

const BY_AREA = new Map(AREA_GROUPS.flatMap((g) => g.areas).map((a) => [a.area as string, a]));

export const areaGuideOf = (area: string): AreaGuide | undefined => BY_AREA.get(area);
