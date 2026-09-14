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
  return `https://map.kakao.com/link/map/${encodeURIComponent(name)},${lat},${lng}`;
}
