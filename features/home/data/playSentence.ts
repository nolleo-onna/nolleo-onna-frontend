/**
 * 홈 "오늘 어떻게 놀까?" 문장 만들기 — 밑줄 친 세 자리(누구랑·어떤 하루·예산)에 끼울 말과,
 * 고른 조합을 AI 채팅에 넣을 프롬프트로 이어 붙이는 함수. 화면에 보이는 말(label)과
 * AI에게 보내는 말(prompt)을 나눠, 문장은 짧게 읽히고 프롬프트는 구체적이게 한다.
 */
export interface SentenceOption {
  id: string;
  /** 문장 속 밑줄 자리에 보이는 말 */
  label: string;
  /** AI에게 보낼 프롬프트 조각 */
  prompt: string;
}

export interface MoodOption extends SentenceOption {
  /** 이 하루를 떠올리게 하는 부산 사진 (관광공사) */
  imageUrl: string;
}

export const WHO_OPTIONS: SentenceOption[] = [
  { id: "solo", label: "혼자", prompt: "혼자" },
  { id: "couple", label: "연인이랑", prompt: "연인이랑" },
  { id: "friends", label: "친구랑", prompt: "친구랑" },
  { id: "family", label: "가족이랑", prompt: "가족이랑" },
];

export const MOOD_OPTIONS: MoodOption[] = [
  {
    id: "sea",
    label: "바다 보며 쉬는",
    prompt: "한적한 바다 보면서 쉬는",
    imageUrl: "https://tong.visitkorea.or.kr/cms/resource/22/3495922_image2_1.jpg",
  },
  {
    id: "alley",
    label: "골목 카페 도는",
    prompt: "감성 골목이랑 카페 위주로 도는",
    imageUrl: "https://tong.visitkorea.or.kr/cms/resource/37/3492437_image2_1.jpg",
  },
  {
    id: "indoor",
    label: "실내에서 보내는",
    prompt: "비 와도 괜찮은 실내 위주의",
    imageUrl: "http://tong.visitkorea.or.kr/cms/resource/62/2712662_image2_1.jpg",
  },
  {
    id: "night",
    label: "야경 보는",
    prompt: "황령산·해운대처럼 야경 예쁜 곳 도는",
    imageUrl: "http://tong.visitkorea.or.kr/cms/resource/50/2732750_image2_1.jpg",
  },
  {
    id: "food",
    label: "맛집 도는",
    prompt: "국제시장·자갈치 같은 맛집 도는",
    imageUrl: "http://tong.visitkorea.or.kr/cms/resource/30/3476830_image2_1.jpg",
  },
  {
    id: "nature",
    label: "숲길 걷는",
    prompt: "태종대·이기대처럼 자연 속을 걷는",
    imageUrl: "https://tong.visitkorea.or.kr/cms/resource/83/3506383_image2_1.jpg",
  },
];

export const BUDGET_OPTIONS: SentenceOption[] = [
  { id: "free", label: "거의 무료", prompt: "돈은 거의 안 쓰고 싶어." },
  { id: "30k", label: "3만원 안쪽", prompt: "예산은 1인 3만원 안쪽이야." },
  { id: "50k", label: "5만원 안쪽", prompt: "예산은 1인 5만원 안쪽이야." },
  { id: "plenty", label: "넉넉하게", prompt: "예산은 넉넉해." },
];

/** 고른 세 자리를 AI 채팅 입력창에 채울 한 문장으로 */
export function buildPlayPrompt(who: SentenceOption, mood: SentenceOption, budget: SentenceOption): string {
  return `${who.prompt} ${mood.prompt} 부산 코스 짜줘. ${budget.prompt}`;
}
