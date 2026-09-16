import { clientFetch } from "@/libs/clientFetch";
import type {
  ApiErrorResponse,
  ApiResponse,
  CourseGenerateRequest,
  CourseGenerateResult,
  CourseResponse,
  CourseLikeToggleResult,
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

// 공유 코스 좋아요 토글 — 로그인 필요. 사용자당 코스 1회, 다시 누르면 취소.
export async function toggleSharedCourseLike(shareToken: string): Promise<CourseLikeToggleResult> {
  const res = await clientFetch(
    `/api/v1/courses/shared/${encodeURIComponent(shareToken)}/likes/toggle`,
    { method: "POST" },
  );
  if (!res.ok) {
    const error = await res
      .json()
      .then((json: ApiErrorResponse | null) => json)
      .catch(() => null);
    throw new CourseUpdateError(error?.message || "좋아요를 반영하지 못했어요", res.status);
  }
  const json: ApiResponse<CourseLikeToggleResult> = await res.json();
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

/** 폼 코스 생성 실패. errorCode로 어느 칸이 잘못됐는지 구분한다 */
export class CourseGenerateError extends Error {
  readonly status: number;
  readonly errorCode: string;

  constructor(message: string, status: number, errorCode: string) {
    super(message);
    this.name = "CourseGenerateError";
    this.status = status;
    this.errorCode = errorCode;
  }
}

const GENERATE_ERROR_MESSAGE: Record<string, string> = {
  UNKNOWN_START_AREA: "아직 코스를 만들 수 없는 지역이에요. 다른 지역을 골라주세요",
  NO_SPOT_CANDIDATES: "이 근처에서 담을 만한 장소를 찾지 못했어요. 다른 지역으로 해볼까요?",
  INVALID_REQUEST: "입력 내용을 확인해주세요",
};

/**
 * 서버 원문 메시지는 화면에 절대 내보내지 않는다.
 * 엔드포인트가 아직 배포되지 않으면 스프링이 "No static resource api/v1/courses." 같은
 * 내부 메시지를 404로 내려주는데, 그게 그대로 사용자에게 보이면 자기 입력이 잘못된 줄 안다.
 * 원문은 콘솔에만 남기고, 화면에는 우리가 쓴 문구만 쓴다.
 */
function generateErrorMessage(status: number, errorCode: string): string {
  const known = GENERATE_ERROR_MESSAGE[errorCode];
  if (known) return known;

  // 404 = 이 경로에 매핑된 API가 없음 (백엔드 미배포). 사용자가 다시 눌러도 소용없다.
  if (status === 404 || status === 501) {
    return "코스 만들기 기능이 아직 서버에 준비되지 않았어요. 잠시 뒤 다시 시도해주세요";
  }
  if (status >= 500) {
    return "서버에 문제가 생겨 코스를 만들지 못했어요. 잠시 뒤 다시 시도해주세요";
  }
  return "코스를 만들지 못했어요. 잠시 뒤 다시 시도해주세요";
}

/**
 * 폼(지역·예산·꼭 포함 장소·축제)으로 코스를 한 번에 만든다.
 * AI를 거치지 않아 일일 제한이 없고 보통 1초 안에 응답한다 — 챗봇 같은 긴 로딩 UI가 필요 없다.
 * 못 찾은 장소·축제는 에러가 아니라 응답의 unmatched로 오고 생성은 그대로 진행된다.
 */
export async function generateCourse(body: CourseGenerateRequest): Promise<CourseGenerateResult> {
  const res = await clientFetch("/api/v1/courses", {
    method: "POST",
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const error = await res
      .json()
      .then((json: ApiErrorResponse | null) => json)
      .catch(() => null);
    const code = error?.errorCode ?? "UNKNOWN";
    // 원문은 개발자가 원인을 찾을 수 있게 콘솔에만 남긴다
    console.error("[generateCourse] 실패", { status: res.status, errorCode: code, message: error?.message });
    throw new CourseGenerateError(generateErrorMessage(res.status, code), res.status, code);
  }

  const json: ApiResponse<CourseGenerateResult> = await res.json();
  return json.data;
}
