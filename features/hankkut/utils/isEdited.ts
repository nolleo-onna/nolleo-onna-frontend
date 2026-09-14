/**
 * 수정된 글·댓글인지. 서버가 생성할 때 createdAt과 updatedAt을 몇 ms 차이로 함께 채우기도 해서
 * 단순 비교하면 모든 글에 "(수정됨)"이 붙는다 — 1초 넘게 차이 날 때만 수정으로 본다.
 */
export function isEdited(createdAt: string, updatedAt: string | null | undefined): boolean {
  if (!updatedAt) return false;
  return new Date(updatedAt).getTime() - new Date(createdAt).getTime() > 1000;
}
