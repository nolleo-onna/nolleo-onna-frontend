// 홈 검색바(SearchBar)가 sessionStorage에 저장하는 선택값의 키.
// 다른 페이지(예: 혼잡도 구 패널)에서 지역을 프리셋해 홈으로 보낼 때도 쓴다.
export const SEARCHBAR_SELECTION_KEY = "searchbar-selection";

// 코스 생성 검색바에 지역을 프리셋한다. 기존 선택(예산·시간·동행)은 유지하고
// 지역만 바꾼 뒤, 홈에서 검색바가 이 값을 복원한다.
export function presetCourseRegion(region: string): void {
  try {
    const raw = sessionStorage.getItem(SEARCHBAR_SELECTION_KEY);
    const saved = raw ? (JSON.parse(raw) as Record<string, unknown>) : {};
    sessionStorage.setItem(
      SEARCHBAR_SELECTION_KEY,
      JSON.stringify({
        ...saved,
        activeTab: "course",
        selectedRegion: region,
        hasInteracted: true,
      })
    );
  } catch {
    // sessionStorage 접근 실패 시 프리셋 없이 홈 이동만 한다
  }
}
