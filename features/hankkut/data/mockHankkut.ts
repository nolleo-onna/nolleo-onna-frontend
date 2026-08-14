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
    title: "광안리 불꽃축제 D-DAY, 미리미리 자리 잡는 꿀팁",
    summary: "광안대교를 배경으로 펼쳐지는 화려한 불꽃쇼, 명당 자리를 알려드립니다.",
    date: "2026.06.11",
    region: "광안리",
    imageUrl: "http://tong.visitkorea.or.kr/cms/resource/45/3311245_image2_1.jpg",
    views: 3241,
  },
  {
    id: 2,
    category: "무료로 즐기기",
    title: "해운대 야경 명소 BEST 5, 한 푼도 안 쓰고 즐기기",
    summary: "동백섬부터 미포까지, 돈 없이도 충분히 낭만적인 해운대 밤 산책 코스.",
    date: "2026.06.10",
    region: "해운대",
    imageUrl: "http://tong.visitkorea.or.kr/cms/resource/89/3575989_image2_1.jpg",
    views: 2876,
  },
  {
    id: 3,
    category: "할인 혜택 팁",
    title: "부산 시티투어버스 30% 할인받는 법",
    summary: "온라인 사전 예약부터 카드사 제휴까지, 아는 사람만 아는 할인 루트 총정리.",
    date: "2026.06.09",
    region: "부산 전체",
    imageUrl: "http://tong.visitkorea.or.kr/cms/resource/40/3494840_image2_1.jpg",
    views: 1954,
  },
  {
    id: 4,
    category: "무료로 즐기기",
    title: "민락수변공원 피크닉 완벽 가이드",
    summary: "돗자리 하나면 끝. 편의점 위치부터 노을 명당까지 한 번에 정리했어요.",
    date: "2026.06.08",
    region: "광안리",
    imageUrl: "https://tong.visitkorea.or.kr/cms/resource/66/3498366_image2_1.jpg",
    views: 2410,
  },
  {
    id: 5,
    category: "오늘 행사",
    title: "보수동 책방골목 플리마켓, 오늘만 열려요",
    summary: "헌책과 빈티지 소품이 가득한 골목 플리마켓. 주말 한정 운영 정보.",
    date: "2026.06.11",
    region: "원도심",
    imageUrl: "http://tong.visitkorea.or.kr/cms/resource/30/3476830_image2_1.jpg",
    views: 1632,
  },
  {
    id: 6,
    category: "할인 혜택 팁",
    title: "영도 카페 거리, 통신사 멤버십으로 아메리카노 반값",
    summary: "흰여울문화마을 근처 카페 중 멤버십 할인 되는 곳만 모았습니다.",
    date: "2026.06.07",
    region: "영도",
    imageUrl: "http://tong.visitkorea.or.kr/cms/resource/16/2836416_image2_1.jpg",
    views: 1287,
  },
  {
    id: 7,
    category: "무료로 즐기기",
    title: "부산현대미술관 무료 전시 일정 총정리",
    summary: "을숙도에 숨은 미술관, 6월 무료 전시 라인업과 가는 법.",
    date: "2026.06.06",
    region: "사하",
    imageUrl: "https://tong.visitkorea.or.kr/cms/resource/95/3506195_image2_1.jpg",
    views: 987,
  },
  {
    id: 8,
    category: "오늘 행사",
    title: "전포 카페거리 버스킹 공연, 오늘 저녁 7시",
    summary: "전포사잇길에서 열리는 로컬 뮤지션 버스킹. 늦지 않게 도착하세요.",
    date: "2026.06.11",
    region: "서면",
    imageUrl: "https://tong.visitkorea.or.kr/cms/resource/60/3496960_image2_1.jpg",
    views: 1456,
  },
  {
    id: 9,
    category: "할인 혜택 팁",
    title: "자갈치시장 회 싸게 먹는 시간대가 따로 있다?",
    summary: "마감 직전 타임세일부터 흥정 팁까지, 현지인이 알려주는 자갈치 공략법.",
    date: "2026.06.05",
    region: "원도심",
    imageUrl: "http://tong.visitkorea.or.kr/cms/resource/46/3049246_image2_1.JPG",
    views: 3102,
  },
];