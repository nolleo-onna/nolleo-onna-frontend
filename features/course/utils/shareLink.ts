/** 공유 토큰으로 열리는 공개 코스 페이지의 절대 URL. 브라우저에서만 호출한다 */
export function buildCourseShareUrl(shareToken: string): string {
  return `${window.location.origin}/course/shared/${encodeURIComponent(shareToken)}`;
}
