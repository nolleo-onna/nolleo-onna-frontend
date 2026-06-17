import { clientFetch } from "@/libs/clientFetch";
import type {
  ApiResponse,
  CoursePairResponse,
  CourseGenerateRequest,
} from "@/types/course";

export async function generateCourse(
  body: CourseGenerateRequest
): Promise<CoursePairResponse> {
  const res = await clientFetch("/api/v1/courses/generate", {
    method: "POST",
    body: JSON.stringify(body),
  });
  const json: ApiResponse<CoursePairResponse> = await res.json();
  return json.data;
}

export async function fetchCoursePair(
  pairId: string
): Promise<CoursePairResponse> {
  const res = await clientFetch(`/api/v1/courses/pair/${pairId}`);
  const json: ApiResponse<CoursePairResponse> = await res.json();
  return json.data;
}

export async function regenerateCourse(
  courseId: number
): Promise<CoursePairResponse> {
  const res = await clientFetch(`/api/v1/courses/${courseId}/regenerate`, {
    method: "POST",
  });
  const json: ApiResponse<CoursePairResponse> = await res.json();
  return json.data;
}