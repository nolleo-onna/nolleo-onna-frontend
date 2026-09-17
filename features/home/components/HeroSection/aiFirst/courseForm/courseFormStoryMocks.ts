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
  // 수영구(광안리) 추천 — district·분류 필터용
  ["126078", "광안리해수욕장", "수영구", "NA", "45/3311245_image2_1.jpg"],
  ["129140", "금련산", "수영구", "NA", "43/3589743_image2_1.jpg"],
  ["130203", "수영민속예술관", "수영구", "VE", "05/3491505_image2_1.jpg"],
  ["4068714", "포디움다이브", "수영구", "VE", "22/4068722_image2_1.jpg"],
  ["3033472", "망미단길", "수영구", "VE", "50/3033450_image2_1.JPG"],
  ["126799", "민락수변공원", "수영구", "VE", "66/3498366_image2_1.jpg"],
  ["850991", "윤희횟집", "수영구", "FD", "20/1867020_image2_1.jpg"],
  ["134989", "밀레니엄횟집", "수영구", "FD", "43/1866443_image2_1.jpg"],
  ["3582279", "콩셉트", "수영구", "FD", "61/3582161_image2_1.jpg"],
  ["3546069", "비쇼쿠", "수영구", "FD", "75/3546075_image2_1.jpg"],
  ["2868961", "장덕풍천장어 광안본점", "수영구", "FD", "78/3478878_image2_1.jpg"],
  ["2663341", "부산시민공원", "부산진구", "VE", "05/3497005_image2_1.jpg"],
  ["3014435", "서면먹자골목", "부산진구", "VE", "12/3014312_image2_1.JPG"],
  ["126119", "부산 어린이대공원", "부산진구", "VE", "15/3512315_image2_1.jpg"],
  // 동래 · 송도(서구) · 영도 · 기장 · 센텀(해운대구)
  ["130252", "부산해양자연사박물관", "동래구", "VE", "17/3492317_image2_1.jpg"],
  ["3487362", "1934 기차 동래역", "동래구", "VE", "55/3487355_image2_1.jpg"],
  ["1747870", "동래문화회관", "동래구", "VE", "57/3492357_image2_1.jpg"],
  ["3060992", "부산사직종합운동장 사직야구장", "동래구", "VE", "85/3060985_image2_1.JPG"],
  ["2377647", "동신참치", "동래구", "FD", "44/2377644_image2_1.jpg"],
  ["689290", "대관원", "동래구", "FD", "46/1191846_image2_1.jpg"],
  ["2838820", "주문진 막국수", "동래구", "FD", "00/2838800_image2_1.jpg"],
  ["2869113", "배종관동래삼계탕", "동래구", "FD", "07/2869107_image2_1.JPG"],
  ["2760704", "닥밭골 벽화마을", "서구", "VE", "02/3492402_image2_1.jpg"],
  ["3017214", "천마산 조각공원", "서구", "VE", "12/3017212_image2_1.jpg"],
  ["2760699", "비석문화마을", "서구", "VE", "31/4068231_image2_1.jpg"],
  ["3588134", "클램하우스", "서구", "FD", "31/3588131_image2_1.jpg"],
  ["3438936", "빅토리아 베이커리 가든", "서구", "FD", "54/3438854_image2_1.jpg"],
  ["3408797", "송도키친", "서구", "FD", "71/3408371_image2_1.jpg"],
  ["3017282", "영도해녀문화전시관", "영도구", "VE", "16/3592316_image2_1.jpg"],
  ["3375297", "태종대 오션플라잉 테마파크", "영도구", "VE", "42/4017042_image2_1.jpg"],
  ["3017467", "중리항 방파제 등대", "영도구", "VE", "45/3017445_image2_1.JPG"],
  ["2869491", "영도면옥", "영도구", "FD", "12/4007512_image2_1.jpg"],
  ["1128306", "태종대짬뽕", "영도구", "FD", "51/3526951_image2_1.jpg"],
  ["2775577", "젖병등대", "기장군", "VE", "19/3494119_image2_1.jpg"],
  ["2758477", "신평소공원", "기장군", "VE", "04/3494104_image2_1.jpg"],
  ["1805774", "파도횟집", "기장군", "FD", "08/1982908_image2_1.jpg"],
  ["4070624", "제이엠커피로스터스 부산 본점", "기장군", "FD", "39/4070639_image2_1.jpg"],
  ["2650801", "뮤지엄 원", "해운대구", "VE", "01/3493601_image2_1.jpg"],
  ["128828", "부산 올림픽동산", "해운대구", "VE", "10/3492210_image2_1.jpg"],
  ["2668973", "부산엑스더스카이", "해운대구", "VE", "16/3350316_image2_1.jpg"],
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
  ["2786391", "광안리 M(Marvelous) 드론 라이트쇼", "2026-01-01", "2026-12-31", "12/3518612_image3_1.jpeg"],
  ["4099532", "2026 별바다부산 「나이트 캠크닉」", "2026-09-04", "2026-09-19", "41/4099541_image3_1.jpg"],
  ["2558735", "부산국제공연예술제(B.P.A.F)", "2026-09-18", "2026-09-20", "65/4105565_image3_1.jpg"],
  ["3497353", "2026 부산바다도서관", "2026-09-19", "2026-10-11", "07/4106907_image3_1.jpg"],
  ["3006246", "2026 부산국제공연예술마켓(BPAM)", "2026-10-01", "2026-10-07", "73/4094773_image3_1.jpg"],
  ["140799", "부산국제록페스티벌", "2026-10-02", "2026-10-04", "06/4040606_image3_1.jpg"],
  ["2855626", "허심청브로이 옥토버페스트", "2026-10-15", "2026-10-17", "35/4105335_image3_1.jpg"],
  ["229048", "동래읍성역사축제", "2026-10-16", "2026-10-18", "43/3366443_image3_1.jpg"],
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
      const district = url.searchParams.get("district");
      const category = url.searchParams.get("category");
      const size = Number(url.searchParams.get("size") ?? 20);
      const hits = PLACES.filter(
        (p) =>
          squash(p.name).includes(keyword) &&
          (!district || p.district === district) &&
          (!category || p.category === category),
      )
        // 서버의 sort=imageUrl,asc처럼 사진 있는 곳부터
        .sort((a, b) => Number(!!b.imageUrl) - Number(!!a.imageUrl))
        .slice(0, size);
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
