import { clientFetch } from "@/libs/clientFetch";
import type {
  ApiResponse,
  CourseItemsUpdateRequest,
  CourseResponse,
  MyCourseSummary,
} from "@/types/course";

// 내가 생성한 코스 목록 조회
export async function fetchMyCourses(): Promise<MyCourseSummary[]> {
  const res = await clientFetch("/api/v1/courses/me");
  const json: ApiResponse<MyCourseSummary[]> = await res.json();
  return json.data;
}

// 코스의 장소 구성/순서 수정.
// 편집 결과의 최종 순서를 spotContentId 배열로만 보내면(추가는 끼워넣기, 삭제는 빼기)
// 서버가 serialNum·distanceFromPrevM·expectedCost·totalCost를 재계산해
// 수정된 코스 전체를 돌려준다. 그래서 저장 후 GET 재조회가 필요 없다.
// 조회(pairId)와 달리 이 API는 courseId(=CourseResponse.id) 기준이다.
export async function updateCourseItems(
  courseId: number,
  spotContentIds: string[]
): Promise<CourseResponse> {
  const body: CourseItemsUpdateRequest = { spotContentIds };
  const res = await clientFetch(`/api/v1/courses/${courseId}/items`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    // 400 등으로 거절될 때 서버가 이유를 message에 담아주므로 그대로 화면에 보여준다.
    // (예: 코스에 넣을 수 없는 장소가 섞인 경우)
    const message = await res
      .json()
      .then((json: ApiResponse<unknown> | null) => json?.message)
      .catch(() => null);
    throw new Error(message || "코스를 수정하지 못했어요");
  }
  const json: ApiResponse<CourseResponse> = await res.json();
  return json.data;
}
