/**
 * 카카오 링크 경로("이름,위도,경도")에 넣을 장소 이름을 정리한다.
 * 슬래시·역슬래시가 있으면 인코딩해도 카카오가 404("존재하지 않는 URL") 페이지로 보내고,
 * 쉼표는 이름·좌표 구분자와 겹쳐서 모두 공백으로 바꾼다. (예: 행사 장소 "광안리 해수욕장 / 벡스코")
 */
export function toKakaoLinkName(name: string): string {
  return name.replace(/[/\\,]/g, " ").replace(/\s+/g, " ").trim();
}

/**
 * 카카오맵 길찾기 웹 링크를 만든다.
 * 카카오 공식 URL 스킴(map.kakao.com/link/to)이라 API 키가 필요 없다.
 */
export function getKakaoMapDirectionsUrl(
  name: string,
  lat: number,
  lng: number,
): string {
  return `https://map.kakao.com/link/to/${encodeURIComponent(toKakaoLinkName(name))},${lat},${lng}`;
}

/**
 * 카카오맵에서 장소 위치를 여는 웹 링크(map.kakao.com/link/map). 코스 내용을 글로 공유할 때
 * 받는 사람이 로그인 없이 장소를 바로 찾을 수 있게 장소마다 붙인다.
 */
export function getKakaoMapPlaceUrl(name: string, lat: number, lng: number): string {
  // 카톡에 붙였을 때 한글 이름이 %EC%.. 로 길게 깨져 보이지 않게 한글은 그대로 두고,
  // 공백·#·? 처럼 링크를 끊거나 바꾸는 나머지 문자만 인코딩한다 (카카오 공식 예시도 한글 그대로 쓴다)
  const label = Array.from(toKakaoLinkName(name))
    .map((ch) => (/[가-힣ㄱ-ㅎㅏ-ㅣ]/.test(ch) ? ch : encodeURIComponent(ch)))
    .join("");
  return `https://map.kakao.com/link/map/${label},${lat},${lng}`;
}
