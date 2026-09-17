import type { BusanEvent } from "@/types/event";
import type { MapPlace, MapPlacePage } from "@/types/map";

/*
 * 스토리북 전용 — 개발 API에 닿지 않는 환경에서도 "이재"만 쳐서 후보가 뜨는지 보려고
 * 운영 API(/api/v1/map/places, /api/v1/events)에서 받아 둔 실제 응답 일부를 흉내 낸다.
 * 이름 부분 일치는 서버 동작과 같게 공백을 무시하고 거른다.
 */

const IMG = "https://tong.visitkorea.or.kr/cms/resource/";

type PlaceRow = [originalId: string, name: string, district: string | null, category: MapPlace["category"], image: string | null];

const PLACE_ROWS: PlaceRow[] = [
  ["2836450", "이재모피자 본점", "중구", "FD", "38/2836438_image2_1.jpg"],
  ["3053", "피자여신", null, "FD", null],
  ["3947", "라리에또화덕피자", null, "FD", null],
  ["3951", "피자스쿨", null, "FD", null],
  ["2274", "킹스피자 일광점", "일광면", "FD", null],
  ["253", "부산밀면", null, "FD", null],
  ["3268", "가온밀면", null, "FD", null],
  ["6842", "약콩밀면", "용호동", "FD", null],
  ["313", "사천돼지국밥", null, "FD", null],
  ["3649", "진짜 돼지국밥", null, "FD", null],
  ["6332", "광안시장박고지김밥", "광안4동", "FD", null],
  ["6534", "양가손만두 부전시장점", "부전1동", "FD", null],
  ["1805965", "전포카페거리", "부산진구", "VE", "60/3496960_image2_1.jpg"],
  ["2822334", "동래온천길(온천천 카페거리)", "동래구", "VE", "33/2822333_image2_1.png"],
  ["3064803", "우리글방 북카페", "중구", "VE", "91/3064791_image2_1.JPG"],
  ["127925", "광안리해변 테마거리", "수영구", "VE", "42/3071042_image2_1.JPG"],
  ["3014437", "민락해변공원", "수영구", "VE", "62/3014362_image2_1.JPG"],
  ["2785289", "감지해변", "영도구", "NA", null],
  ["1805619", "해변짚불곰장어", "기장군", "FD", "92/1902292_image2_1.jpg"],
  ["1277679", "부산타워", "중구", "HS", "40/3494840_image2_1.jpg"],
];

const PLACES: MapPlace[] = PLACE_ROWS.map(([originalId, name, district, category, image], i) => ({
  id: i + 1,
  placeType: category === "FD" ? "FOOD" : "SPOT",
  originalId,
  name,
  // 실제 응답에도 district가 null인 맛집이 많다
  district: district as string,
  category,
  longitude: 129.05,
  latitude: 35.15,
  imageUrl: image ? IMG + image : null,
  minPrice: null,
  free: false,
  avgRating: 0,
  reviewCount: 0,
}));

type EventRow = [contentId: string, title: string, start: string, end: string, image: string | null];

const EVENT_ROWS: EventRow[] = [
  ["140799", "부산국제록페스티벌", "2026-10-02", "2026-10-04", "06/4040606_image3_1.jpg"],
  ["2991394", "2026 부산나이트워크42K with dsec", "2026-08-29", "2026-08-30", "37/4069137_image3_1.jpg"],
  ["2644679", "2026 부산국제불교박람회", "2026-08-06", "2026-08-09", "92/4077792_image3_1.jpg"],
  ["3498395", "2026 나이트레이스 인 부산", "2026-08-01", "2026-08-01", "41/4065341_image3_1.jpg"],
  ["2523149", "K-핸드메이드페어 부산 2026", "2026-07-24", "2026-07-26", "66/4059066_image3_1.jpg"],
  ["2704473", "K-일러스트레이션페어 부산 2026", "2026-07-24", "2026-07-26", null],
];

const EVENTS = EVENT_ROWS.map(
  ([contentId, title, eventStartDate, eventEndDate, image]) =>
    ({
      contentId,
      title,
      eventStartDate,
      eventEndDate,
      firstImage: image ? IMG + image : null,
      firstImage2: null,
    }) as BusanEvent,
);

const json = (data: unknown) =>
  new Response(JSON.stringify({ status: 200, message: "ok", data }), {
    headers: { "Content-Type": "application/json" },
  });

const squash = (s: string) => s.replace(/\s/g, "").toLowerCase();

let installed = false;

/** 장소·행사 목록 요청만 가로채고 나머지는 원래 fetch로 보낸다 */
export function installCourseFormFetchMock() {
  if (installed || typeof window === "undefined") return;
  installed = true;
  const original = window.fetch.bind(window);

  window.fetch = async (input, init) => {
    const raw = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
    const url = new URL(raw, window.location.href);

    if (url.pathname.endsWith("/api/v1/map/places")) {
      const keyword = squash(url.searchParams.get("keyword") ?? "");
      const size = Number(url.searchParams.get("size") ?? 20);
      const hits = PLACES.filter((p) => squash(p.name).includes(keyword)).slice(0, size);
      await new Promise((r) => setTimeout(r, 180)); // 네트워크 느낌
      const page: MapPlacePage = {
        content: hits,
        totalElements: hits.length,
        totalPages: 1,
        last: true,
        numberOfElements: hits.length,
      };
      return json(page);
    }
    if (url.pathname.endsWith("/api/v1/events")) return json(EVENTS);

    return original(input, init);
  };
}
