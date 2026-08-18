import { clientFetch } from "@/libs/clientFetch";
import type {
  ApiResponse,
  CoursePairResponse,
  MyCourseSummary,
} from "@/types/course";
 
// 내가 생성한 코스 목록 조회
export async function fetchMyCourses(): Promise<MyCourseSummary[]> {
  const res = await clientFetch("/api/v1/courses/me");
  const json: ApiResponse<MyCourseSummary[]> = await res.json();
  return json.data;
}
 
// pairId로 생성된 코스 조회
export async function fetchCoursePair(
  pairId: string
): Promise<CoursePairResponse> {
  const res = await clientFetch(`/api/v1/courses/${pairId}`);
  const json: ApiResponse<CoursePairResponse> = await res.json();
  return json.data;
}