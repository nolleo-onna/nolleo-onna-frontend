import { formatDistance } from "@/features/course/utils/format";
import { getKakaoMapPlaceUrl } from "@/features/course/utils/kakaoMapLink";

interface ShareTextPlace {
  name: string;
  lat: number;
  lng: number;
  expectedCost?: number;
  distanceFromPrevM?: number;
}

export interface CourseShareTextInput {
  title: string;
  description?: string;
  places: ShareTextPlace[];
  /** 누구나 열 수 있는 사이트 링크. 홈에 올라간(공개) 코스만 있다 */
  siteUrl?: string | null;
}

function formatWon(won: number): string {
  return won === 0 ? "무료" : `${won.toLocaleString("ko-KR")}원`;
}

/**
 * 카카오톡·SNS에 붙여 넣을 코스 소개 글. 코스를 공개하지 않아도 받는 사람이 읽을 수 있도록
 * 제목 · 요약 · 장소 순서 · 장소별 카카오맵 링크를 글 자체에 담는다. 공개 코스면 사이트 링크를 끝에 붙인다.
 */
export function buildCourseShareText({ title, description, places, siteUrl }: CourseShareTextInput): string {
  const totalCost = places.reduce((sum, place) => sum + (place.expectedCost ?? 0), 0);
  const totalDistance = places.reduce((sum, place) => sum + (place.distanceFromPrevM ?? 0), 0);
  const summary = [
    `${places.length}곳`,
    totalDistance > 0 ? `총 ${formatDistance(totalDistance)}` : null,
    `예상 비용 ${formatWon(totalCost)}`,
  ]
    .filter(Boolean)
    .join(" · ");

  const lines = [`[놀러온나] ${title}`];
  const intro = description?.trim();
  if (intro) lines.push(intro);
  lines.push("", summary);

  places.forEach((place, index) => {
    const cost = place.expectedCost === undefined ? "" : ` · ${formatWon(place.expectedCost)}`;
    lines.push(`${index + 1}. ${place.name}${cost}`, `   ${getKakaoMapPlaceUrl(place.name, place.lat, place.lng)}`);
  });

  if (siteUrl) lines.push("", `놀러온나에서 보기: ${siteUrl}`);
  return lines.join("\n");
}
