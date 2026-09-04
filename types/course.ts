// 공통 API 응답 래퍼
export type ApiResponse<T> = {
  status: number;
  message: string;
  data: T;
};

// GET /api/v1/courses/me — 내 코스 목록 아이템
export interface MyCourseSummary {
  id: number;
  pairId: string;
  title: string;
  description: string;
  totalCost: number;
  spotTitles: string[];
}

// ── 코스 조회/수정 응답 ────────────────────────────────────
// GET /api/v1/courses/{pairId}, PUT /api/v1/courses/{courseId}/items 공통 형태.
// 조회는 data가 배열, 수정은 data가 단일 객체로 온다.
export interface CourseItemResponse {
  serialNum: number;
  spotContentId: string;
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
  description: string;
  totalCost: number;
  items: CourseItemResponse[];
  createdAt: string;
}

// PUT /api/v1/courses/{courseId}/items 요청 바디.
// 편집 후 최종 순서의 spotContentId만 보내면 서버가 serialNum·거리·비용을 재계산한다.
export interface CourseItemsUpdateRequest {
  spotContentIds: string[];
}
