import { clientFetch } from "@/libs/clientFetch";
import type {
  ApiErrorResponse,
  ApiResponse,
  CourseResponse,
  CourseUpdateRequest,
  MyCourseSummary,
  PopularCourse,
  SharedCourse,
} from "@/types/course";

// 내가 생성한 코스 목록 조회
export async function fetchMyCourses(): Promise<MyCourseSummary[]> {
  const res = await clientFetch("/api/v1/courses/me");
  const json: ApiResponse<MyCourseSummary[]> = await res.json();
  return json.data;
}

/**
 * 코스 수정 실패. 검증 실패(400)면 fieldErrors에 필드별 메시지가 담기고,
 * 그 외(장소 없음·동시 수정 충돌 등)는 message 하나로 온다.
 */
export class CourseUpdateError extends Error {
  readonly status: number;
  readonly fieldErrors: Partial<Record<"title" | "description" | "items", string>>;

  constructor(
    message: string,
    status: number,
    fieldErrors: CourseUpdateError["fieldErrors"] = {},
  ) {
    super(message);
    this.name = "CourseUpdateError";
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

// errorList의 field는 "title" / "description" / "items" / "items[2].originalId" 형태다.
// items 하위 오류는 어느 칸인지 사용자에게 보여줄 방법이 없어 items 하나로 모은다.
function toFieldErrors(
  errorList: NonNullable<ApiErrorResponse["errorList"]>,
): CourseUpdateError["fieldErrors"] {
  const errors: CourseUpdateError["fieldErrors"] = {};
  for (const { field, message } of errorList) {
    const key = field.startsWith("items")
      ? "items"
      : field === "title" || field === "description"
        ? field
        : null;
    if (key && !errors[key]) errors[key] = message;
  }
  return errors;
}

// 코스 수정 — 제목·소개·방문 스팟을 한 번에 전체 교체한다.
// 응답이 재계산된 코스 전체라 저장 후 GET 재조회가 필요 없다.
// 조회(pairId)와 달리 이 API는 courseId(=CourseResponse.id) 기준이다.
export async function updateCourse(
  courseId: number,
  body: CourseUpdateRequest,
): Promise<CourseResponse> {
  const res = await clientFetch(`/api/v1/courses/${courseId}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const error = await res
      .json()
      .then((json: ApiErrorResponse | null) => json)
      .catch(() => null);

    if (error?.errorList?.length) {
      throw new CourseUpdateError(
        "입력 내용을 확인해주세요",
        res.status,
        toFieldErrors(error.errorList),
      );
    }
    // 같은 코스를 다른 곳에서 먼저 저장한 경우 — 서버에는 그쪽이 반영돼 있다
    if (res.status === 409) {
      throw new CourseUpdateError(
        "다른 곳에서 먼저 저장된 코스예요. 새로고침 후 다시 편집해주세요.",
        res.status,
      );
    }
    throw new CourseUpdateError(
      error?.message || "코스를 수정하지 못했어요",
      res.status,
    );
  }
  const json: ApiResponse<CourseResponse> = await res.json();
  return json.data;
}

// 코스 공개/비공개 전환 — 토글이 아니라 목표 상태를 보낸다. 공개하면 share.shareToken이 발급된다.
export async function updateCourseVisibility(
  courseId: number,
  isPublic: boolean,
): Promise<CourseResponse> {
  const res = await clientFetch(`/api/v1/courses/${courseId}/visibility`, {
    method: "PATCH",
    body: JSON.stringify({ isPublic }),
  });
  if (!res.ok) {
    const error = await res
      .json()
      .then((json: ApiErrorResponse | null) => json)
      .catch(() => null);
    throw new CourseUpdateError(
      error?.message || "공개 상태를 바꾸지 못했어요",
      res.status,
    );
  }
  const json: ApiResponse<CourseResponse> = await res.json();
  return json.data;
}

// 공유 링크로 공개 코스 조회 — 로그인 불필요. 없거나 비공개면 404
export async function fetchSharedCourse(shareToken: string): Promise<SharedCourse> {
  const res = await clientFetch(`/api/v1/courses/shared/${encodeURIComponent(shareToken)}`, {
    publicEndpoint: true,
  });
  if (!res.ok) throw new CourseUpdateError("코스를 찾을 수 없어요", res.status);
  const json: ApiResponse<SharedCourse> = await res.json();
  return json.data;
}

// 인기 공개 코스 — 로그인 불필요. 백엔드 API가 아직 없으면 빈 목록으로 다뤄 홈이 깨지지 않게 한다.
// 없는 엔드포인트는 시큐리티가 먼저 막아 404가 아니라 401/403으로 오므로 셋 다 빈 목록으로 본다.
export async function fetchPopularCourses(size = 6): Promise<PopularCourse[]> {
  const res = await clientFetch(`/api/v1/courses/popular?size=${size}`, { publicEndpoint: true });
  if (res.status === 401 || res.status === 403 || res.status === 404) return [];
  if (!res.ok) throw new Error("인기 코스를 불러오지 못했어요");
  const json: ApiResponse<PopularCourse[]> = await res.json();
  return json.data ?? [];
}
