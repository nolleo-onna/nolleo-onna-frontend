export type HankkutCategory = "오늘 행사" | "무료로 즐기기" | "할인 혜택 팁";

export interface Hankkut {
  id: number;
  category: HankkutCategory;
  title: string;
  summary: string;
  date: string;
  region: string;
  imageUrl: string;
  views: number;
}

export const HANKKUT_CATEGORIES = [
  "전체",
  "오늘 행사",
  "무료로 즐기기",
  "할인 혜택 팁",
] as const;

export const MOCK_HANKKUT_LIST: Hankkut[] = [
  {
    id: 1,
    category: "오늘 행사",
    title: "이번 주 토요일 광안리 드론쇼, 밤 8시·10시 두 번 뜹니다",
    summary: "매주 토요일 광안리 하늘을 수놓는 M 드론라이트쇼. 하절기엔 20시·22시 2회 공연, 관람은 무료예요.",
    date: "2026.08.18",
    region: "광안리",
    imageUrl: "http://tong.visitkorea.or.kr/cms/resource/45/3311245_image2_1.jpg",
    views: 3241,
  },
  {
    id: 2,
    category: "무료로 즐기기",
    title: "해운대 야경 명소 BEST 5, 한 푼도 안 쓰고 즐기기",
    summary: "동백섬부터 미포까지, 돈 없이도 충분히 낭만적인 해운대 밤 산책 코스.",
    date: "2026.08.16",
    region: "해운대",
    imageUrl: "http://tong.visitkorea.or.kr/cms/resource/89/3575989_image2_1.jpg",
    views: 2876,
  },
  {
    id: 3,
    category: "할인 혜택 팁",
    title: "부산 시티투어버스 30% 할인받는 법",
    summary: "온라인 사전 예약부터 카드사 제휴까지, 아는 사람만 아는 할인 루트 총정리.",
    date: "2026.08.14",
    region: "부산 전체",
    imageUrl: "http://tong.visitkorea.or.kr/cms/resource/40/3494840_image2_1.jpg",
    views: 1954,
  },
  {
    id: 4,
    category: "무료로 즐기기",
    title: "민락수변공원 피크닉 완벽 가이드",
    summary: "돗자리 하나면 끝. 편의점 위치부터 노을 명당까지 한 번에 정리했어요.",
    date: "2026.08.15",
    region: "광안리",
    imageUrl: "https://tong.visitkorea.or.kr/cms/resource/66/3498366_image2_1.jpg",
    views: 2410,
  },
  {
    id: 5,
    category: "오늘 행사",
    title: "부산국제코미디페스티벌 21일 개막, 해운대 야외 공연은 무료",
    summary: "8월 21일부터 열흘간 열리는 제14회 코미디페스티벌. 해운대 구남로 코미디 스트리트는 공짜로 즐겨요.",
    date: "2026.08.18",
    region: "해운대",
    imageUrl: "https://tong.visitkorea.or.kr/cms/resource/34/3090534_image2_1.JPG",
    views: 1632,
  },
  {
    id: 6,
    category: "할인 혜택 팁",
    title: "영도 카페 거리, 통신사 멤버십으로 아메리카노 반값",
    summary: "흰여울문화마을 근처 카페 중 멤버십 할인 되는 곳만 모았습니다.",
    date: "2026.08.12",
    region: "영도",
    imageUrl: "http://tong.visitkorea.or.kr/cms/resource/16/2836416_image2_1.jpg",
    views: 1287,
  },
  {
    id: 7,
    category: "무료로 즐기기",
    title: "부산현대미술관 무료 전시 일정 총정리",
    summary: "을숙도에 숨은 미술관, 8월 무료 전시 라인업과 가는 법.",
    date: "2026.08.13",
    region: "사하",
    imageUrl: "https://tong.visitkorea.or.kr/cms/resource/95/3506195_image2_1.jpg",
    views: 987,
  },
  {
    id: 8,
    category: "할인 혜택 팁",
    title: "부산국제영화제 티켓, 9월 7일까지 조기예매하면 20% 할인",
    summary: "10월 6일 개막하는 제31회 BIFF. 일반 예매(9/14) 전에 조기예매로 먼저 싸게 잡으세요.",
    date: "2026.08.17",
    region: "센텀·남포",
    imageUrl: "https://tong.visitkorea.or.kr/cms/resource/19/3493419_image2_1.jpg",
    views: 1456,
  },
  {
    id: 9,
    category: "할인 혜택 팁",
    title: "자갈치시장 회 싸게 먹는 시간대가 따로 있다?",
    summary: "마감 직전 타임세일부터 흥정 팁까지, 현지인이 알려주는 자갈치 공략법.",
    date: "2026.08.11",
    region: "원도심",
    imageUrl: "http://tong.visitkorea.or.kr/cms/resource/46/3049246_image2_1.JPG",
    views: 3102,
  },
];