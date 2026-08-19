import { DISTRICT_COORDS } from "@/features/spot/constants/districtCoords";
import type { MapPlace } from "@/types/map";

/**
 * 스팟 검색 파이프라인.
 * "광안리 카페", "무료 박물관", "ㅎㅇㄷ" 같은 입력을 토큰 단위로 해석해
 * 지역(구/동네)·카테고리·무료 조건·이름 검색어로 나눠 적용한다.
 */

export interface Neighborhood {
  district: string;
  lat: number;
  lng: number;
}

// 사람들이 실제로 검색하는 동네/명소 이름 → 소속 구와 중심 좌표.
// 행정구 이름은 DISTRICT_COORDS가 따로 처리하므로 여기엔 안 넣는다.
export const NEIGHBORHOODS: Record<string, Neighborhood> = {
  광안리: { district: "수영구", lat: 35.1532, lng: 129.1186 },
  민락: { district: "수영구", lat: 35.157, lng: 129.1215 },
  서면: { district: "부산진구", lat: 35.1579, lng: 129.0594 },
  전포: { district: "부산진구", lat: 35.1553, lng: 129.0648 },
  남포동: { district: "중구", lat: 35.0988, lng: 129.0304 },
  남포: { district: "중구", lat: 35.0988, lng: 129.0304 },
  광복동: { district: "중구", lat: 35.0996, lng: 129.0287 },
  자갈치: { district: "중구", lat: 35.0967, lng: 129.0306 },
  송정: { district: "해운대구", lat: 35.1785, lng: 129.1997 },
  센텀: { district: "해운대구", lat: 35.169, lng: 129.1319 },
  동백섬: { district: "해운대구", lat: 35.1533, lng: 129.152 },
  청사포: { district: "해운대구", lat: 35.1583, lng: 129.19 },
  미포: { district: "해운대구", lat: 35.1602, lng: 129.1749 },
  달맞이: { district: "해운대구", lat: 35.1573, lng: 129.1841 },
  태종대: { district: "영도구", lat: 35.0533, lng: 129.0847 },
  흰여울: { district: "영도구", lat: 35.0785, lng: 129.0448 },
  감천: { district: "사하구", lat: 35.0975, lng: 129.0106 },
  다대포: { district: "사하구", lat: 35.0466, lng: 128.9655 },
  을숙도: { district: "사하구", lat: 35.1069, lng: 128.9464 },
  온천장: { district: "동래구", lat: 35.22, lng: 129.0866 },
  오시리아: { district: "기장군", lat: 35.193, lng: 129.213 },
};

// 카테고리 코드별 검색 키워드 (카테고리 라벨: NA 자연·해변 / VE 관광·문화 /
// HS 역사·문화유산 / EX 체험·액티비티 / LS 레저스포츠 / FD 맛집·카페)
const CATEGORY_KEYWORDS: Record<string, MapPlace["category"][]> = {
  카페: ["FD"], 맛집: ["FD"], 음식: ["FD"], 식당: ["FD"], 먹거리: ["FD"],
  커피: ["FD"], 디저트: ["FD"], 빵집: ["FD"], 먹방: ["FD"],
  바다: ["NA"], 해변: ["NA"], 해수욕장: ["NA"], 자연: ["NA"], 산: ["NA"],
  공원: ["NA"], 숲: ["NA"], 섬: ["NA"], 힐링: ["NA"],
  관광: ["VE"], 문화: ["VE"], 박물관: ["VE"], 미술관: ["VE"], 전시: ["VE"],
  시장: ["VE"], 명소: ["VE"],
  역사: ["HS"], 사찰: ["HS"], 절: ["HS"], 유적: ["HS"], 문화유산: ["HS"], 향교: ["HS"],
  체험: ["EX"], 액티비티: ["EX"], 테마파크: ["EX"], 아쿠아리움: ["EX"],
  레저: ["LS"], 스포츠: ["LS"], 서핑: ["LS"], 요트: ["LS"],
};

const FREE_KEYWORDS = new Set(["무료", "공짜"]);

const CHOSEONG = [
  "ㄱ", "ㄲ", "ㄴ", "ㄷ", "ㄸ", "ㄹ", "ㅁ", "ㅂ", "ㅃ", "ㅅ", "ㅆ",
  "ㅇ", "ㅈ", "ㅉ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ",
];

/** 한글 음절을 초성으로 변환 ("해운대" → "ㅎㅇㄷ"). 한글이 아니면 그대로 둔다 */
export function toChoseong(str: string): string {
  let result = "";
  for (const ch of str) {
    const code = ch.charCodeAt(0) - 0xac00;
    result += code >= 0 && code < 11172 ? CHOSEONG[Math.floor(code / 588)] : ch;
  }
  return result;
}

function isChoseongQuery(term: string): boolean {
  return /^[ㄱ-ㅎ]{2,}$/.test(term);
}

/** 공백 제거 + 소문자 — "해운대 해수욕장"과 "해운대해수욕장"을 같게 취급 */
function normalize(str: string): string {
  return str.replace(/\s+/g, "").toLowerCase();
}

function matchDistrict(token: string): string | null {
  for (const district of Object.keys(DISTRICT_COORDS)) {
    if (district === token) return district;
    if (district.replace(/[구군]$/, "") === token) return district;
  }
  return null;
}

export interface ParsedSearch {
  /** 행정구 (구 이름을 직접 검색) */
  district: string | null;
  /** 동네/명소 (광안리, 서면 등) */
  neighborhood: Neighborhood | null;
  neighborhoodName: string | null;
  categories: Set<MapPlace["category"]>;
  freeOnly: boolean;
  /** 지역/카테고리로 해석되지 않은 나머지 = 이름 검색어 */
  nameTerms: string[];
  isEmpty: boolean;
}

export function parseSearch(raw: string): ParsedSearch {
  const parsed: ParsedSearch = {
    district: null,
    neighborhood: null,
    neighborhoodName: null,
    categories: new Set(),
    freeOnly: false,
    nameTerms: [],
    isEmpty: true,
  };
  const tokens = raw.trim().split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return parsed;
  parsed.isEmpty = false;

  tokens.forEach((token) => {
    if (FREE_KEYWORDS.has(token)) {
      parsed.freeOnly = true;
      return;
    }
    const district = token.length >= 2 ? matchDistrict(token) : null;
    if (district) {
      parsed.district = district;
      return;
    }
    if (NEIGHBORHOODS[token]) {
      parsed.neighborhood = NEIGHBORHOODS[token];
      parsed.neighborhoodName = token;
      return;
    }
    const categoryCodes = CATEGORY_KEYWORDS[token];
    if (categoryCodes) {
      categoryCodes.forEach((code) => parsed.categories.add(code));
      return;
    }
    parsed.nameTerms.push(normalize(token));
  });

  return parsed;
}

export function filterPlaces(places: MapPlace[], parsed: ParsedSearch): MapPlace[] {
  if (parsed.isEmpty) return places;

  const district = parsed.district ?? parsed.neighborhood?.district ?? null;

  return places.filter((p) => {
    if (district && p.district !== district) return false;
    if (parsed.categories.size > 0 && !parsed.categories.has(p.category)) return false;
    if (parsed.freeOnly && !p.free) return false;

    if (parsed.nameTerms.length > 0) {
      const normName = normalize(p.name);
      const choName = toChoseong(normName);
      // 여러 단어면 전부 포함해야 매칭 (AND). 초성만 친 단어는 초성으로 대조
      return parsed.nameTerms.every((term) =>
        isChoseongQuery(term) ? choName.includes(term) : normName.includes(term),
      );
    }
    return true;
  });
}

/**
 * 검색 결과에 맞춰 지도가 이동할 좌표 목록.
 * 동네·구 검색은 중심 한 점(→ 확대 이동), 그 외에는 결과 좌표 전체(→ 범위 맞춤).
 */
export function getMapCoords(
  parsed: ParsedSearch,
  results: MapPlace[],
): { lat: number; lng: number }[] {
  if (parsed.neighborhood) {
    return [{ lat: parsed.neighborhood.lat, lng: parsed.neighborhood.lng }];
  }
  if (parsed.district) {
    const coords = DISTRICT_COORDS[parsed.district];
    return coords ? [coords] : [];
  }
  return results.slice(0, 60).map((p) => ({ lat: p.latitude, lng: p.longitude }));
}

/** 결과가 0건일 때 "혹시 OO 찾으세요?"로 제안할 지역/동네 이름 */
export function suggestPlaceName(raw: string): string | null {
  const term = normalize(raw);
  if (term.length < 1) return null;
  const candidates = [...Object.keys(NEIGHBORHOODS), ...Object.keys(DISTRICT_COORDS)];
  return (
    candidates.find((name) => normalize(name).startsWith(term)) ??
    candidates.find((name) => toChoseong(name).startsWith(term)) ??
    null
  );
}

/** 검색창이 비어있을 때 보여줄 추천 검색어 */
export const SEARCH_SUGGESTIONS = ["광안리", "해운대 카페", "무료", "박물관", "서면 맛집"];
