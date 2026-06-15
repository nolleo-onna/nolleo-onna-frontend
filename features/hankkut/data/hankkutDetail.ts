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