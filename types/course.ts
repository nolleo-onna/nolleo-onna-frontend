// 공통 API 응답 래퍼
export type ApiResponse<T> = {
  status: number;
  message: string;
  data: T;
};

// 검증 실패(400) 응답. 이때는 message 대신 errorList에 필드 단위 메시지가 담긴다.
export interface ApiErrorResponse {
  status: number;
  errorCode: string;
  message?: string;
  errorList?: { field: string; message: string }[];
}

// GET /api/v1/courses/me — 내 코스 목록 아이템
export interface MyCourseSummary {
  id: number;
  pairId: string;
  title: string;
  description: string;
  totalCost: number;
  isPublic: boolean;
  likeCount: number;
  spotTitles: string[];
}

// 코스 공개 공유 상태 — 소유자 조회(GET /courses/{pairId}, PUT, PATCH visibility)에서만 내려온다
export interface CourseShareInfo {
  isPublic: boolean;
  /** 공유 링크 토큰. 한 번도 공개한 적 없으면 null. 비공개로 돌려도 유지된다 */
  shareToken: string | null;
  viewCount: number;
  likeCount: number;
}

// ── 코스 조회/수정 응답 ────────────────────────────────────
// GET /api/v1/courses/{pairId}, PUT /api/v1/courses/{courseId} 공통 형태.
// 조회는 data가 배열, 수정은 data가 단일 객체로 온다.
export type CoursePlaceType = "SPOT" | "FOOD";

export interface CourseItemResponse {
  serialNum: number;
  /** 장소 타입. 코스 편집은 현재 SPOT만 허용된다. */
  placeType: CoursePlaceType;
  /** 원본 식별자 — SPOT이면 관광공사 contentId. Map API의 originalId와 같은 값 */
  originalId: string;
  title: string;
  mapX: number;
  mapY: number;
  firstImage: string | null;
  category: string;
  /** 무료이거나 비용을 모르는 장소는 null */
  expectedCost: number | null;
  distanceFromPrevM: number;
}

export interface CourseResponse {
  id: number;
  pairId: string;
  generationMode: string;
  title: string;
  /** 소개가 없으면 null */
  description: string | null;
  /** 음식점이 하나도 없으면 null */
  totalCost: number | null;
  items: CourseItemResponse[];
  share: CourseShareInfo;
  createdAt: string;
}

// GET /api/v1/courses/shared/{shareToken} — 로그인 없이 보는 공개 코스.
// id·pairId·토큰은 담기지 않고 작성자는 닉네임으로만 노출된다.
export interface SharedCourse {
  title: string;
  description: string | null;
  totalCost: number | null;
  items: CourseItemResponse[];
  authorNickname: string | null;
  authorProfileImageUrl: string | null;
  viewCount: number;
  likeCount: number;
  createdAt: string;
}

// ── 코스 수정 ──────────────────────────────────────────────
// 서버 검증 규칙과 같은 값. 초과분은 입력 단계에서 막고, 서버는 최종 방어선이다.
export const COURSE_TITLE_MAX = 50;
export const COURSE_DESCRIPTION_MAX = 200;

export interface CourseUpdateItem {
  placeType: CoursePlaceType;
  originalId: string;
}

// PUT /api/v1/courses/{courseId} 요청 바디 — 전체 교체 방식.
// 바뀌지 않은 필드도 현재 값을 담아 보내야 한다. description을 비우거나 빼면 소개가 지워진다.
// items는 순번 없이 배열 순서가 곧 방문 순서이며, 서버가 serialNum·거리·비용을 재계산한다.
export interface CourseUpdateRequest {
  title: string;
  description: string | null;
  items: CourseUpdateItem[];
}

// GET /api/v1/courses/popular — 홈 "지금 인기 있는 코스" 카드.
// 백엔드 합의안(2026-09-11): 공개 코스만, 조회수 → 최신순. 로그인 불필요.
// 카드 클릭은 shareToken으로 /course/shared/{token}에 연결한다.
export interface PopularCourse {
  shareToken: string;
  title: string;
  description: string | null;
  totalCost: number | null;
  /** 방문 순서대로의 스팟 이름 */
  spotTitles: string[];
  /** 첫 스팟 대표 이미지. 없으면 null */
  thumbnailImageUrl: string | null;
  authorNickname: string | null;
  authorProfileImageUrl: string | null;
  viewCount: number;
  likeCount: number;
  createdAt: string;
}
