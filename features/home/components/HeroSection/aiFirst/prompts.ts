/** 히어로에서 눌러 바로 온나에게 물어볼 수 있는 예시 — 지역·동행·예산·분위기가 골고루 들어가게 */
export const HERO_PROMPTS = [
  { emoji: "🌊", text: "광안리에서 친구랑 3만원으로 반나절" },
  { emoji: "🌙", text: "서면에서 연인이랑 야경 보는 저녁 코스" },
  { emoji: "☔", text: "비 오는 날 아이랑 갈 실내 코스" },
  { emoji: "🚶", text: "혼자 조용히 걷기 좋은 바다 산책길" },
] as const;

/** 입력창 placeholder로 돌아가며 보여줄 문장 */
export const HERO_PLACEHOLDERS = [
  "광안리에서 친구랑 3만원으로 반나절 놀고 싶어",
  "부모님 모시고 가기 좋은 영도 코스 짜줘",
  "전포 카페 골목 위주로 오후 코스",
  "사람 덜 붐비는 해운대 산책 코스",
] as const;
