
export interface ThemeCourse {
  id: number;
  subTitle: string;
  title: string;
  description: string;
  /** AI 채팅으로 전송될 프롬프트 */
  prompt: string;
  /** lucide-react 아이콘 이름 */
  icon: "Sun" | "Heart" | "CloudRain" | "Moon" | "UtensilsCrossed" | "Trees";
  /** 카드 배경 그라데이션 */
  gradient: string;
}

export const THEME_COURSES: ThemeCourse[] = [
  {
    id: 1,
    subTitle: "SOLO HEALING",
    title: "혼자 여행",
    description: "조용한 바다와 카페 한 곳",
    prompt: "혼자 조용히 쉴 수 있는 부산 바다 코스 짜줘. 한적한 해변이랑 분위기 좋은 카페 위주로!",
    icon: "Sun",
    gradient: "from-[#4FA8DE] to-[#185FA5]",
  },
  {
    id: 2,
    subTitle: "CHEAP & CHIC",
    title: "짠내 데이트",
    description: "5만원 이하 감성 코스",
    prompt: "연인과 5만원 이하로 즐길 수 있는 부산 감성 데이트 코스 짜줘",
    icon: "Heart",
    gradient: "from-[#ED93B1] to-[#993556]",
  },
  {
    id: 3,
    subTitle: "RAINY DAY",
    title: "비오는 날 여행",
    description: "실내 위주 큐레이션",
    prompt: "비 오는 날 부산에서 실내 위주로 즐길 수 있는 코스 짜줘. 박물관이나 카페 같은 곳으로!",
    icon: "CloudRain",
    gradient: "from-[#7F91A8] to-[#3D4E63]",
  },
  {
    id: 4,
    subTitle: "NIGHT VIBE",
    title: "부산 야경 투어",
    description: "광안리와 해운대 밤바다",
    prompt: "광안리랑 해운대 야경 볼 수 있는 부산 저녁 코스 짜줘",
    icon: "Moon",
    gradient: "from-[#7F77DD] to-[#3C3489]",
  },
  {
    id: 5,
    subTitle: "FOOD TRIP",
    title: "부산 먹방 투어",
    description: "국제시장과 자갈치 맛집",
    prompt: "국제시장이랑 자갈치 쪽으로 부산 먹방 코스 짜줘. 로컬 맛집 위주로!",
    icon: "UtensilsCrossed",
    gradient: "from-[#F0997B] to-[#993C1D]",
  },
  {
    id: 6,
    subTitle: "NATURE WALK",
    title: "자연 힐링 코스",
    description: "태종대와 이기대 산책",
    prompt: "태종대랑 이기대 같은 부산 자연 경관 위주로 산책 코스 짜줘",
    icon: "Trees",
    gradient: "from-[#97C459] to-[#3B6D11]",
  },
];