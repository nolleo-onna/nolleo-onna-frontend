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
  /** 내가 좋아요를 눌렀는지 — 비로그인이면 항상 false */
  likedByMe: boolean;
  createdAt: string;
}

// POST /api/v1/courses/shared/{shareToken}/likes/toggle 응답
export interface CourseLikeToggleResult {
  /** 토글 후 내 좋아요 상태 */
  liked: boolean;
  likeCount: number;
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

// ── 폼 코스 생성 (POST /api/v1/courses) ────────────────────
// 챗봇과 달리 AI를 거치지 않아 일일 제한이 없고 보통 1초 안에 응답한다.

/** 예산 등급. 생략·null이면 서버가 UNLIMITED로 본다 */
export type CourseBudgetTier = "NONE" | "UNDER_10K" | "UNDER_30K" | "UNDER_50K" | "UNLIMITED";

export interface CourseGenerateRequest {
  /** 시작 지역. constants/course의 COURSE_START_AREAS 중 하나여야 한다 */
  startArea: string;
  budget?: CourseBudgetTier;
  /** 꼭 포함할 장소명. 최대 5개, 각 1~50자 */
  includeSpots?: string[];
  /** 축제·행사명. 최대 50자. 찾으면 축제 좌표가 코스 검색 중심이 된다 */
  festival?: string;
}

export interface CourseGenerateMatchedSpot {
  /** 사용자가 입력한 이름 */
  name: string;
  /** 데이터에서 찾은 실제 제목 */
  matchedTitle: string;
  contentId: string;
}

export interface CourseGenerateMatchedFestival {
  name: string;
  matchedTitle: string;
  /** 행사 기간 "M.d~M.d". 종료일이 없으면 "11.1~" */
  period: string;
}

/** 서버가 실제로 적용한 조건 — 입력과 다를 수 있다 */
export interface CourseGenerateApplied {
  /** 축제를 찾았으면 축제 위치에 가장 가까운 지원 지역으로 바뀐다 */
  startArea: string;
  budget: {
    tier: CourseBudgetTier;
    /** true면 예산 상한 안에서 식사·카페를 다 못 채워 상한을 풀고 채웠다 */
    filterRelaxed: boolean;
  };
  includeSpots: CourseGenerateMatchedSpot[];
  festival: CourseGenerateMatchedFestival | null;
}

/** 찾지 못해 생성에서 빠진 입력. 에러가 아니라 생성은 정상 진행된다 */
export interface CourseGenerateUnmatched {
  includeSpots: string[];
  festival: string | null;
}

export interface CourseGenerateResult {
  pairId: string;
  /** GET /api/v1/courses/{pairId}와 같은 구조. 현재 1개 */
  courses: CourseResponse[];
  applied: CourseGenerateApplied;
  unmatched: CourseGenerateUnmatched;
}
