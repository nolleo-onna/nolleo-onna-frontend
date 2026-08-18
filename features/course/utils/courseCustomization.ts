// 백엔드에 코스 수정 API가 없어서, 사용자가 결과 페이지에서 바꾼 장소
// 순서/제외 목록을 pairId별로 localStorage에 보관해 같은 브라우저에서
// 재방문해도 유지되게 한다.
const STORAGE_KEY = "course:customizations";

export interface CourseCustomization {
  /** serialNum 순서. 여기 없는 장소는 뒤에 원래 순서대로 붙는다. */
  order?: number[];
  /** 코스에서 제외한 장소의 serialNum 목록 */
  removed?: number[];
}

function readMap(): Record<string, CourseCustomization> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return typeof parsed === "object" && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

export function loadCourseCustomization(
  pairId: string,
): CourseCustomization | undefined {
  const value = readMap()[pairId];
  return typeof value === "object" && value !== null ? value : undefined;
}

export function saveCourseCustomization(
  pairId: string,
  customization: CourseCustomization,
) {
  try {
    const map = readMap();
    map[pairId] = customization;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    // 저장 실패(시크릿 모드 등)는 편집이 유지되지 않을 뿐이라 무시
  }
}

export function clearCourseCustomization(pairId: string) {
  try {
    const map = readMap();
    delete map[pairId];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    // 무시
  }
}
