// 코스 생성 시 확정한 예산은 백엔드에 저장되지 않아서, 코스 목록 등
// budget 파라미터 없는 경로로 결과 페이지에 다시 들어오면 게이지를 그릴
// 기준값이 사라진다. pairId → 예산 금액을 localStorage에 보관해 복원한다.
const STORAGE_KEY = "course:budgets";

function readMap(): Record<string, number> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return typeof parsed === "object" && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

export function saveCourseBudget(pairId: string, budget: number) {
  try {
    const map = readMap();
    map[pairId] = budget;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    // 저장 실패(시크릿 모드 등)는 게이지가 안 보일 뿐이라 무시
  }
}

export function loadCourseBudget(pairId: string): number | undefined {
  const value = readMap()[pairId];
  return typeof value === "number" && value >= 0 ? value : undefined;
}
