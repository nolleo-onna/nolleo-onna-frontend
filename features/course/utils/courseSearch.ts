import type { PopularCourse } from "@/types/course";

export type CourseSortKey = "popular" | "latest" | "liked";

/** 띄어쓰기·대소문자를 무시하고 견준다 — "해운대 해변열차"도 "해운대해변"으로 찾힌다 */
const squash = (value: string) => value.replace(/\s/g, "").toLowerCase();

/**
 * 코스 목록 API가 검색어를 받지 않아(넣어도 전체를 준다) 불러온 코스를 화면에서 거른다.
 * 코스 이름이나 들르는 곳 이름에 걸리면 보여준다 — "해운대" → 해운대가 들어간 코스.
 */
export function filterCourses<T extends Pick<PopularCourse, "title" | "spotTitles">>(
  courses: T[],
  keyword: string,
): T[] {
  const needle = squash(keyword);
  if (!needle) return courses;
  return courses.filter(
    (course) =>
      squash(course.title).includes(needle) ||
      course.spotTitles.some((spot) => squash(spot).includes(needle)),
  );
}

/** 서버가 주는 순서(조회수 → 최신)가 인기순이라, 나머지만 다시 정렬한다 */
export function sortCourses<T extends Pick<PopularCourse, "createdAt" | "likeCount" | "viewCount">>(
  courses: T[],
  key: CourseSortKey,
): T[] {
  if (key === "popular") return courses;
  const sorted = [...courses];
  if (key === "latest") sorted.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  if (key === "liked") sorted.sort((a, b) => b.likeCount - a.likeCount || b.viewCount - a.viewCount);
  return sorted;
}
