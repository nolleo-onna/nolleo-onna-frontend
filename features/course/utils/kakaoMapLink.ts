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
