import {
  type Hankkut,
  MOCK_HANKKUT_LIST,
} from "@/features/hankkut/data/mockHankkut";

export interface RelatedSpot {
  id: number;
  name: string;
  region: string;
  price: string;
}

export interface HankkutDetail extends Hankkut {
  hashtags: string[];
  content: string;
  address: string;
  hours: string;
  fee: string;
  relatedSpots: RelatedSpot[];
}

const DETAIL_EXTRAS: Record<number, Omit<HankkutDetail, keyof Hankkut>> = {
  1: {
    hashtags: ["광안리", "축제", "야외", "불꽃"],
    content:
      "광안리 불꽃축제는 매년 10월 말 열리는 부산 최대 축제입니다. 광안대교를 배경으로 하늘을 수놓는 불꽃은 정말 장관인데요, 좋은 자리를 잡으려면 2~3시간 전에 미리 도착하는 것이 좋습니다. 추천 포인트는 ① 광안리 해수욕장 중앙 ② 민락수변공원 ③ 광안대교 아래 광안동 해안입니다. 돗자리와 따뜻한 옷차림은 필수!",
    address: "부산 수영구 광안해변로",
    hours: "상시",
    fee: "무료",
    relatedSpots: [
      { id: 1, name: "광안리 해수욕장", region: "광안리", price: "무료" },
      { id: 2, name: "광안리 카페 바다다", region: "광안리", price: "6,000원~" },
    ],
  },
  2: {
    hashtags: ["해운대", "야경", "무료", "산책"],
    content:
      "해운대의 밤은 낮보다 아름답습니다. 동백섬 등대 전망대에서 보는 마린시티 야경, 미포 방파제에서 보는 광안대교, 달맞이고개의 문탠로드까지. 모두 입장료 없이 즐길 수 있는 코스입니다. 저녁 8시 이후가 조명이 가장 예쁘고, 미포에서 출발해 동백섬 방향으로 걷는 동선을 추천합니다.",
    address: "부산 해운대구 해운대해변로",
    hours: "상시",
    fee: "무료",
    relatedSpots: [
      { id: 5, name: "해운대 해수욕장", region: "해운대", price: "무료" },
      { id: 6, name: "동백섬", region: "해운대", price: "무료" },
    ],
  },
  3: {
    hashtags: ["시티투어버스", "할인", "교통", "관광"],
    content:
      "부산 시티투어버스는 해운대·광안리·감천문화마을 등 주요 명소를 한 번에 도는 순환 버스인데, 정가로 끊으면 은근히 아깝습니다. 공식 홈페이지에서 사전 온라인 예약을 하면 현장 구매보다 20% 저렴하고, 여기에 일부 카드사 제휴 할인을 더하면 최대 30%까지 아낄 수 있어요. 특히 시간이 부족한 반나절 여행자에게 유용한데, 배차 간격이 30~40분이라 시간표를 미리 확인하고 움직이는 게 좋습니다.",
    address: "부산역 시티투어버스 승차장",
    hours: "09:30 ~ 17:00 (배차 30~40분)",
    fee: "1일권 기준 정가 대비 최대 30% 할인",
    relatedSpots: [
      { id: 31, name: "해운대 해수욕장", region: "해운대", price: "무료" },
      { id: 32, name: "감천문화마을", region: "사하", price: "무료" },
    ],
  },
  4: {
    hashtags: ["민락수변공원", "피크닉", "노을", "광안리"],
    content:
      "민락수변공원은 광안대교를 정면으로 바라보며 돗자리를 펼 수 있는 부산 대표 피크닉 명소입니다. 공원 입구 쪽에 편의점과 포장마차가 몰려있어 먹거리 걱정 없이 즉흥적으로 가기 좋고, 잔디밭보다 바다 쪽 데크 자리가 노을과 야경을 동시에 즐기기 좋은 명당이에요. 해 지기 1시간 전(여름 기준 오후 6시 전후)에 자리를 잡아두면 노을부터 광안대교 조명 점등까지 이어서 볼 수 있습니다.",
    address: "부산 수영구 민락수변로 33",
    hours: "상시 (편의점 24시간)",
    fee: "무료",
    relatedSpots: [
      { id: 33, name: "광안리 해수욕장", region: "광안리", price: "무료" },
      { id: 34, name: "민락 회센터", region: "광안리", price: "1인 2~3만원대" },
    ],
  },
  5: {
    hashtags: ["보수동책방골목", "플리마켓", "원도심", "빈티지"],
    content:
      "보수동 책방골목은 헌책방 수십 곳이 모여있는 부산의 대표 원도심 골목인데, 매달 마지막 주말에는 골목 초입에서 소규모 플리마켓이 열립니다. 오래된 책과 LP판부터 빈티지 소품, 수공예품까지 다양하게 나오고, 규모는 크지 않지만 골목 특유의 분위기 덕에 구경하는 재미가 있어요. 국제시장·자갈치시장과 도보로 이어져 있어 원도심 나들이 코스에 함께 넣기 좋습니다.",
    address: "부산 중구 보수동1가 책방골목",
    hours: "매달 마지막 주말 11:00 ~ 17:00 (책방은 상시 운영)",
    fee: "무료",
    relatedSpots: [
      { id: 35, name: "국제시장", region: "원도심", price: "무료 입장" },
      { id: 36, name: "자갈치시장", region: "원도심", price: "무료 입장" },
    ],
  },
  6: {
    hashtags: ["영도", "카페거리", "통신사할인", "멤버십"],
    content:
      "흰여울문화마을 근처 영도 카페 거리는 바다 뷰가 예쁘기로 유명한데, 의외로 통신사 멤버십 할인을 받을 수 있는 곳이 꽤 있습니다. 통신 3사 앱에서 '영도구'로 검색하면 아메리카노 반값이나 사이즈업 쿠폰이 뜨는 매장을 확인할 수 있어요. 결제 전에 직원에게 멤버십 할인 여부를 먼저 물어보는 게 안전하고, 주말엔 자리가 금방 차니 평일 오전 방문을 추천합니다.",
    address: "부산 영도구 절영로 (흰여울문화마을 일대)",
    hours: "매장별 상이 (대체로 10:00 ~ 20:00)",
    fee: "통신사 멤버십 제시 시 최대 50% 할인",
    relatedSpots: [
      { id: 37, name: "흰여울문화마을", region: "영도", price: "무료" },
      { id: 38, name: "태종대", region: "영도", price: "무료" },
    ],
  },
  7: {
    hashtags: ["부산현대미술관", "무료전시", "을숙도", "문화"],
    content:
      "을숙도에 자리한 부산현대미술관은 상설 전시 중 상당수를 무료로 운영합니다. 도심에서 조금 떨어져 있어 붐비지 않고 여유롭게 관람하기 좋은데, 미술관 앞 을숙도 생태공원까지 이어서 산책하면 반나절 코스로 딱 좋아요. 무료 전시 라인업은 매달 바뀌니 방문 전 공식 홈페이지나 SNS에서 이번 달 전시를 확인하고 가는 걸 추천합니다.",
    address: "부산 사하구 낙동남로 1191",
    hours: "10:00 ~ 18:00 (매주 월요일 휴관)",
    fee: "상설 전시 무료 (기획 전시는 유료일 수 있음)",
    relatedSpots: [
      { id: 39, name: "을숙도 생태공원", region: "사하", price: "무료" },
    ],
  },
  8: {
    hashtags: ["전포카페거리", "버스킹", "서면", "로컬뮤지션"],
    content:
      "전포사잇길은 감각적인 카페와 편집숍이 몰려있는 골목인데, 저녁 시간대에 종종 로컬 뮤지션들의 버스킹이 열립니다. 정해진 무대 없이 골목 곳곳에서 즉흥적으로 시작되는 경우가 많아 우연히 마주치는 재미가 있어요. 공연이 있는 날은 골목 초입부터 사람이 몰리니 조금 여유 있게 도착해서 근처 카페 테라스 자리를 잡아두는 게 좋습니다.",
    address: "부산 부산진구 전포대로186번길 (전포사잇길)",
    hours: "저녁 7시경 (비정기적)",
    fee: "무료",
    relatedSpots: [
      { id: 40, name: "전포 카페거리", region: "서면", price: "무료" },
    ],
  },
  9: {
    hashtags: ["자갈치시장", "회", "타임세일", "현지인꿀팁"],
    content:
      "자갈치시장에서 회를 가장 싸게 먹는 방법은 영업 마감 1~2시간 전(보통 오후 8시 이후)을 노리는 것입니다. 이 시간대엔 당일 재고를 처리하려는 상인분들이 먼저 흥정을 걸어오기도 해요. 흥정은 '2층 초장집 자릿세 포함해서 얼마냐'고 통으로 물어보는 게 핵심이고, 여러 집을 비교하지 말고 마음에 드는 곳 한 곳과 편하게 흥정하는 게 현지인 방식입니다.",
    address: "부산 중구 자갈치해안로 52",
    hours: "05:00 ~ 22:00 (상인별 상이)",
    fee: "1인 2~4만원대 (흥정 시 최대 30% 절약)",
    relatedSpots: [
      { id: 41, name: "자갈치시장", region: "원도심", price: "1인 2~4만원대" },
      { id: 42, name: "국제시장", region: "원도심", price: "무료 입장" },
    ],
  },
};

const DEFAULT_EXTRA: Omit<HankkutDetail, keyof Hankkut> = {
  hashtags: ["부산", "여행"],
  content:
    "부산 여행을 더 알차게 만들어 줄 정보입니다. 자세한 내용은 곧 업데이트될 예정이에요.",
  address: "부산광역시",
  hours: "상시",
  fee: "무료",
  relatedSpots: [],
};

export function getHankkutDetail(id: number): HankkutDetail | null {
  const base = MOCK_HANKKUT_LIST.find((item) => item.id === id);
  if (!base) return null;

  return { ...base, ...(DETAIL_EXTRAS[id] ?? DEFAULT_EXTRA) };
}

export function getOtherHankkutList(currentId: number, count = 3): Hankkut[] {
  return MOCK_HANKKUT_LIST.filter((item) => item.id !== currentId).slice(
    0,
    count,
  );
}