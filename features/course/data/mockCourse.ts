export interface CoursePlace {
  id: number;
  name: string;
  category: string;  // union → string (API category가 FD, VE 등 자유 문자열)
  description: string;
  lat: number;
  lng: number;
  rating: number;
  reviewCount: number;
  imageUrl: string;
  originalId?: string;  // SpotDetailModal 연동용
  mapPlaceId?: number;
  expectedCost?: number;
  distanceFromPrevM?: number;
}

export interface CourseDay {
  day: number;
  title: string;
  places: CoursePlace[];
}

export interface Course {
  id: number;
  title: string;
  /** 코스 소개. 서버 코스는 편집 대상이라 정식 필드로 두고, 목업 코스는 없어도 된다. */
  description?: string;
  days: CourseDay[];
}

export const MOCK_COURSE: Course = {
  id: 1,
  title: "광안리부터 원도심까지, 부산 2박 3일",
  days: [
    {
      day: 1,
      title: "광안리 일대 바다 코스",
      places: [
        {
          id: 1,
          name: "광안리해수욕장",
          category: "관광명소",
          description: "광안대교 뷰와 함께 즐기는 부산 대표 해변",
          lat: 35.1532,
          lng: 129.1186,
          rating: 4.6,
          reviewCount: 5231,
          imageUrl: "https://picsum.photos/seed/gwangalli/240/240",
        },
        {
          id: 2,
          name: "민락수변공원",
          category: "관광명소",
          description: "바다 바로 앞에서 즐기는 부산식 치맥 성지",
          lat: 35.1565,
          lng: 129.1268,
          rating: 4.4,
          reviewCount: 2918,
          imageUrl: "https://picsum.photos/seed/millak/240/240",
        },
        {
          id: 3,
          name: "수변최고돼지국밥",
          category: "음식점",
          description: "부산 와서 안 먹으면 섭섭한 돼지국밥 맛집",
          lat: 35.1559,
          lng: 129.1253,
          rating: 4.5,
          reviewCount: 1847,
          imageUrl: "https://picsum.photos/seed/gukbap/240/240",
        },
        {
          id: 4,
          name: "온더선셋",
          category: "카페",
          description: "광안대교 노을이 통창으로 들어오는 오션뷰 카페",
          lat: 35.1517,
          lng: 129.1166,
          rating: 4.3,
          reviewCount: 1204,
          imageUrl: "https://picsum.photos/seed/sunsetcafe/240/240",
        },
      ],
    },
    {
      day: 2,
      title: "해운대 핵심 코스",
      places: [
        {
          id: 5,
          name: "해운대해수욕장",
          category: "관광명소",
          description: "사계절 활기 넘치는 부산 NO.1 해변",
          lat: 35.1587,
          lng: 129.1604,
          rating: 4.7,
          reviewCount: 8412,
          imageUrl: "https://picsum.photos/seed/haeundae/240/240",
        },
        {
          id: 6,
          name: "동백섬",
          category: "관광명소",
          description: "누리마루와 등대까지 이어지는 산책 코스",
          lat: 35.1529,
          lng: 129.1506,
          rating: 4.5,
          reviewCount: 3106,
          imageUrl: "https://picsum.photos/seed/dongbaek/240/240",
        },
        {
          id: 7,
          name: "더베이101",
          category: "술집/바",
          description: "마린시티 야경과 함께하는 피쉬앤칩스",
          lat: 35.1561,
          lng: 129.1525,
          rating: 4.2,
          reviewCount: 2754,
          imageUrl: "https://picsum.photos/seed/thebay/240/240",
        },
        {
          id: 8,
          name: "해리단길",
          category: "카페",
          description: "옛 철길 골목에 들어선 감성 카페 거리",
          lat: 35.1645,
          lng: 129.1597,
          rating: 4.3,
          reviewCount: 1932,
          imageUrl: "https://picsum.photos/seed/haeridan/240/240",
        },
      ],
    },
    {
      day: 3,
      title: "원도심 감성 코스",
      places: [
        {
          id: 9,
          name: "감천문화마을",
          category: "관광명소",
          description: "알록달록 계단식 마을, 부산의 마추픽추",
          lat: 35.0976,
          lng: 129.0107,
          rating: 4.6,
          reviewCount: 6523,
          imageUrl: "https://picsum.photos/seed/gamcheon/240/240",
        },
        {
          id: 10,
          name: "자갈치시장",
          category: "쇼핑",
          description: "싱싱한 해산물을 바로 맛보는 부산 대표 시장",
          lat: 35.0966,
          lng: 129.0306,
          rating: 4.4,
          reviewCount: 4218,
          imageUrl: "https://picsum.photos/seed/jagalchi/240/240",
        },
        {
          id: 11,
          name: "BIFF광장",
          category: "관광명소",
          description: "씨앗호떡 들고 걷는 영화의 거리",
          lat: 35.0986,
          lng: 129.0277,
          rating: 4.3,
          reviewCount: 2891,
          imageUrl: "https://picsum.photos/seed/biff/240/240",
        },
        {
          id: 12,
          name: "흰여울문화마을",
          category: "관광명소",
          description: "절벽 아래 바다가 펼쳐지는 영도 골목길",
          lat: 35.0786,
          lng: 129.0455,
          rating: 4.5,
          reviewCount: 3647,
          imageUrl: "https://picsum.photos/seed/huinnyeoul/240/240",
        },
      ],
    },
  ],
};

/** 두 좌표 사이 거리(m) — 하버사인 공식 */
export function getDistance(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const R = 6371000;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}