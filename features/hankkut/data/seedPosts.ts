import type { HankkutPost } from "@/features/hankkut/hooks/useHankkutPosts";

// 자유게시판 데모용 시드 글. 처음 방문하면 localStorage가 비어 있어 모든
// 동네가 텅 비어 보이는데, 이 글들로 "사람들이 실제로 코스를 짜고 후기를
// 나누는" 느낌을 미리 채워둔다. authorId는 900000번대로 몰아 실제 로그인
// 유저의 id와 절대 겹치지 않게 해서(삭제 버튼은 본인 글에만 뜬다) 시드
// 글을 실수로 지울 수 없게 한다.
export const HANKKUT_SEED_POSTS: HankkutPost[] = [
  {
    id: "seed-haeundae-1",
    regionSlug: "haeundae",
    title: "AI가 짜준 해운대 반나절 코스 완전 만족ㅋㅋ",
    content:
      "예산 5만원, 연인이랑 반나절로 부탁했더니 미포항 → 해운대해수욕장 → 마린시티 야경 순서로 짜주더라고요. 걷기 동선도 편하고 노을 타이밍까지 딱 맞아서 인생샷 건졌습니다 📸",
    author: "짠내여행러",
    authorId: 900001,
    createdAt: "2026-08-18T11:20:00.000Z",
    views: 341,
  },
  {
    id: "seed-haeundae-2",
    regionSlug: "haeundae",
    title: "오늘 해운대 밤바다 사람 진짜 많네요",
    content:
      "주말이라 그런지 백사장 자리 잡기 힘들었어요. 그래도 미포 쪽은 상대적으로 여유롭더라구요. 붐비는 거 피하고 싶으면 미포 방향 추천!",
    author: "야경덕후",
    authorId: 900002,
    createdAt: "2026-08-17T22:05:00.000Z",
    views: 128,
  },
  {
    id: "seed-haeundae-3",
    regionSlug: "haeundae",
    title: "해운대 근처 숙소 저렴하게 잡는 팁 있을까요?",
    content:
      "9월 초 2박3일 예정인데 해변 바로 앞 숙소는 너무 비싸서요. 도보 10분 이내로 가성비 좋은 곳 아시는 분 계신가요?",
    author: "여행초보",
    authorId: 900003,
    createdAt: "2026-08-16T09:40:00.000Z",
    views: 76,
  },
  {
    id: "seed-gwangalli-1",
    regionSlug: "gwangalli",
    title: "AI 코스 추천으로 광안리 드론쇼 보고 왔어요",
    content:
      "친구들이랑, 예산 3만원으로 부탁했더니 민락수변공원 → 드론쇼 관람 → 근처 포차 코스로 짜줬어요. 돗자리 챙겨가서 앞자리 사수 성공했습니다!",
    author: "부산토박이92",
    authorId: 900004,
    createdAt: "2026-08-18T20:15:00.000Z",
    views: 289,
  },
  {
    id: "seed-gwangalli-2",
    regionSlug: "gwangalli",
    title: "광안리 야시장 몇 시까지 하나요?",
    content:
      "이번 주말에 갈 예정인데 운영시간 아시는 분 계신가요? 저녁 8시쯤 도착할 것 같아서요.",
    author: "궁금이",
    authorId: 900005,
    createdAt: "2026-08-15T14:30:00.000Z",
    views: 54,
  },
  {
    id: "seed-seomyeon-1",
    regionSlug: "seomyeon",
    title: "서면에서 AI가 짜준 저녁 맛집 코스 후기",
    content:
      "가족이랑, 예산 5만원으로 부탁했더니 서면 먹자골목 위주로 짜주던데 웨이팅 있는 곳도 있었지만 다 맛있었어요. 다음엔 좀 더 여유롭게 짜달라고 해봐야겠어요.",
    author: "먹부림",
    authorId: 900006,
    createdAt: "2026-08-17T19:00:00.000Z",
    views: 163,
  },
  {
    id: "seed-seomyeon-2",
    regionSlug: "seomyeon",
    title: "서면 주차 편한 곳 있을까요",
    content: "차 가지고 가려는데 주차비 아낄 수 있는 곳 있으면 공유 부탁드려요.",
    author: "운전자",
    authorId: 900007,
    createdAt: "2026-08-14T10:12:00.000Z",
    views: 41,
  },
  {
    id: "seed-nampo-1",
    regionSlug: "nampo",
    title: "자갈치시장 AI 코스로 다녀왔어요",
    content:
      "국제시장 → 자갈치시장 → 깡통야시장 순서로 코스를 짜주던데 로컬 느낌 물씬 났어요. 회 먹을 때 흥정 팁도 여기 게시판에서 봤던 거 써먹었습니다 ㅋㅋ",
    author: "현지인같은여행",
    authorId: 900008,
    createdAt: "2026-08-18T13:45:00.000Z",
    views: 205,
  },
  {
    id: "seed-nampo-2",
    regionSlug: "wondosim",
    title: "부산근대역사관 무료 관람 정보",
    content: "원도심 걷다가 우연히 들렀는데 무료였어요. 비 오는 날 코스로 괜찮은 것 같아요.",
    author: "산책좋아",
    authorId: 900009,
    createdAt: "2026-08-13T16:20:00.000Z",
    views: 33,
  },
  {
    id: "seed-yeongdo-1",
    regionSlug: "yeongdo",
    title: "흰여울문화마을 AI 코스 공유합니다",
    content:
      "커플 여행, 반나절 예산 3만원으로 부탁했더니 흰여울마을 → 카페거리 → 절영해안산책로로 동선을 잡아줬어요. 사진 찍기 좋은 포인트가 많아서 만족스러웠습니다.",
    author: "필름카메라",
    authorId: 900010,
    createdAt: "2026-08-17T10:50:00.000Z",
    views: 174,
  },
  {
    id: "seed-yeongdo-2",
    regionSlug: "yeongdo",
    title: "영도 카페거리 웨이팅 긴가요?",
    content: "평일 오후에 가면 그나마 나을까요? 인기 많은 곳들 궁금해요.",
    author: "카페투어",
    authorId: 900011,
    createdAt: "2026-08-15T11:05:00.000Z",
    views: 47,
  },
  {
    id: "seed-saha-1",
    regionSlug: "eulsukdo",
    title: "을숙도 AI 코스로 자전거 타고 왔어요",
    content:
      "무지출 코스로 부탁했더니 을숙도생태공원 자전거길 위주로 짜주더라고요. 노을 질 때 진짜 예뻤습니다. 자전거는 대여소에서 빌렸어요.",
    author: "자전거러버",
    authorId: 900012,
    createdAt: "2026-08-16T17:30:00.000Z",
    views: 98,
  },
  {
    id: "seed-gijang-1",
    regionSlug: "gijang",
    title: "기장 AI 드라이브 코스 공유해요",
    content:
      "친구들이랑 반나절, 예산 5만원으로 이기대 → 해변 카페 동선을 받았는데 드라이브하기 완전 좋았어요. 다음엔 일출까지 보고 싶네요.",
    author: "드라이브광",
    authorId: 900013,
    createdAt: "2026-08-14T08:00:00.000Z",
    views: 87,
  },
];
