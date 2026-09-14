/** 공유 토큰으로 열리는 공개 코스 페이지의 절대 URL. 브라우저에서만 호출한다 */
export function buildCourseShareUrl(shareToken: string): string {
  return `${window.location.origin}/course/shared/${encodeURIComponent(shareToken)}`;
}

/** 클립보드에 복사. 성공하면 true */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/**
 * 휴대폰처럼 공유 시트가 있으면 글을 담아 열고, 없으면 클립보드에 복사한다.
 * "복사됐어요"를 띄울 수 있게 클립보드에 복사했을 때만 true를 돌려준다.
 */
export async function shareCourseContent(title: string, text: string): Promise<boolean> {
  if (navigator.share) {
    try {
      await navigator.share({ title, text });
    } catch {
      // 사용자가 공유를 취소한 경우 등 — 조용히 무시
    }
    return false;
  }
  return copyToClipboard(text);
}
