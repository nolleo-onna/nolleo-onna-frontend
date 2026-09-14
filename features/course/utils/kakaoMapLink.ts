/**
 * 카카오맵 길찾기 웹 링크를 만든다.
 * 카카오 공식 URL 스킴(map.kakao.com/link/to)이라 API 키가 필요 없다.
 */
export function getKakaoMapDirectionsUrl(
  name: string,
  lat: number,
  lng: number,
): string {
  return `https://map.kakao.com/link/to/${encodeURIComponent(name)},${lat},${lng}`;
}

/**
 * 카카오맵에서 장소 위치를 여는 웹 링크(map.kakao.com/link/map). 코스 내용을 글로 공유할 때
 * 받는 사람이 로그인 없이 장소를 바로 찾을 수 있게 장소마다 붙인다.
 */
export function getKakaoMapPlaceUrl(name: string, lat: number, lng: number): string {
  // 카톡에 붙였을 때 한글 이름이 %EC%.. 로 길게 깨져 보이지 않게 한글은 그대로 두고,
  // 링크를 끊는 공백과 "이름,위도,경도" 구분자와 겹치는 쉼표만 바꾼다 (카카오 공식 예시도 한글 그대로 쓴다)
  const label = name.trim().replace(/,/g, " ").replace(/\s+/g, "%20");
  return `https://map.kakao.com/link/map/${label},${lat},${lng}`;
}
