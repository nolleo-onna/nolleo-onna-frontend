import type { CongestionSpot } from "@/features/home/utils/congestion";

// 백엔드 혼잡도 API가 관광지별(attractions) 데이터를 아직 안 채워줄 때 쓰는 대체 데이터.
// 실데이터와 같은 모양(CongestionSpot)이라 순위 목록·대표 사진이 똑같이 그려진다.
// district 자리에는 구 이름과 붐비는 시간대를 함께 적어 목록의 보조 문구로 쓴다.
export const CROWD_FALLBACK_SPOTS: CongestionSpot[] = [
  { name: "광안리 해수욕장", district: "수영구 · 14-17시 피크", level: "매우혼잡", rate: 92, imageUrl: "http://tong.visitkorea.or.kr/cms/resource/45/3311245_image2_1.jpg" },
  { name: "해운대 해수욕장", district: "해운대구 · 13-18시 피크", level: "매우혼잡", rate: 87, imageUrl: "https://tong.visitkorea.or.kr/cms/resource/34/3090534_image2_1.JPG" },
  { name: "전포 카페거리", district: "부산진구 · 오후 붐빔", level: "혼잡", rate: 63, imageUrl: "https://tong.visitkorea.or.kr/cms/resource/60/3496960_image2_1.jpg" },
  { name: "서면 먹자골목", district: "부산진구 · 저녁 피크", level: "혼잡", rate: 58, imageUrl: "https://tong.visitkorea.or.kr/cms/resource/12/3014312_image2_1.JPG" },
  { name: "광안리해변 테마거리", district: "수영구 · 저녁 붐빔", level: "혼잡", rate: 54, imageUrl: "http://tong.visitkorea.or.kr/cms/resource/42/3071042_image2_1.JPG" },
];

export const RELAXED_FALLBACK_SPOTS: CongestionSpot[] = [
  { name: "아홉산 숲", district: "기장군 · 종일 한산", level: "여유", rate: 8, imageUrl: "http://tong.visitkorea.or.kr/cms/resource/91/3309791_image2_1.jpg" },
  { name: "부산현대미술관", district: "사하구 · 종일 한산", level: "여유", rate: 10, imageUrl: "https://tong.visitkorea.or.kr/cms/resource/95/3506195_image2_1.jpg" },
  { name: "흰여울문화마을", district: "영도구 · 종일 한산", level: "여유", rate: 12, imageUrl: "https://tong.visitkorea.or.kr/cms/resource/74/3495874_image2_1.jpg" },
  { name: "민락수변공원", district: "수영구 · 오전 한산", level: "여유", rate: 15, imageUrl: "https://tong.visitkorea.or.kr/cms/resource/66/3498366_image2_1.jpg" },
  { name: "태종대", district: "영도구 · 오전 추천", level: "여유", rate: 18, imageUrl: "https://tong.visitkorea.or.kr/cms/resource/83/3506383_image2_1.jpg" },
];
