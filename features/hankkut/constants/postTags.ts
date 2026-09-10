import type { PostCategoryTag, PostDistrictTag } from "@/types/post";

// 백엔드 enum(PostCategoryTag / PostDistrictTag)의 라벨과 동일하게 유지한다
export const POST_CATEGORY_LABELS: Record<PostCategoryTag, string> = {
  CAFE: "카페",
  RESTAURANT: "맛집",
  EXHIBITION: "전시/공연",
  NATURE: "자연/공원",
  HISTORY: "역사/문화",
  ACTIVITY: "체험/액티비티",
  LEISURE: "레저/스포츠",
  FESTIVAL: "축제",
  MARKET: "시장",
  TOURIST_SPOT: "관광지",
  NIGHT_VIEW: "야경",
  DRIVE: "드라이브",
  DATE: "데이트",
  FAMILY: "가족여행",
  SOLO: "혼행",
  PET: "반려동물",
};

export const POST_DISTRICT_LABELS: Record<PostDistrictTag, string> = {
  JUNG_GU: "중구",
  SEO_GU: "서구",
  DONG_GU: "동구",
  YEONGDO_GU: "영도구",
  BUSANJIN_GU: "부산진구",
  DONGNAE_GU: "동래구",
  NAM_GU: "남구",
  BUK_GU: "북구",
  HAEUNDAE_GU: "해운대구",
  SAHA_GU: "사하구",
  GEUMJEONG_GU: "금정구",
  GANGSEO_GU: "강서구",
  YEONJE_GU: "연제구",
  SUYEONG_GU: "수영구",
  SASANG_GU: "사상구",
  GIJANG_GUN: "기장군",
};
