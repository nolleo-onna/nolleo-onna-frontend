/**
 * 로그인 화면에 쓰는 부산 사진 — 한국관광공사(TourAPI) 이미지.
 * 원본이 940×627까지라 화면 전체로 늘리면 흐려진다. 그래서 여러 장을 격자로 깔거나
 * 화면의 절반에만 써서, 사진이 제 크기(≈900px)로 보이게 한다.
 */
const TONG = "https://tong.visitkorea.or.kr/cms/resource/";

export interface LoginPhoto {
  src: string;
  label: string;
}

export const BUSAN_PHOTOS: LoginPhoto[] = [
  { src: `${TONG}45/3311245_image2_1.jpg`, label: "광안리해수욕장" },
  { src: `${TONG}16/3350316_image2_1.jpg`, label: "부산엑스더스카이" },
  { src: `${TONG}66/3498366_image2_1.jpg`, label: "민락수변공원" },
  { src: `${TONG}42/3071042_image2_1.JPG`, label: "광안리해변 테마거리" },
  { src: `${TONG}40/3494840_image2_1.jpg`, label: "부산타워" },
  { src: `${TONG}60/3496960_image2_1.jpg`, label: "전포카페거리" },
  { src: `${TONG}05/3497005_image2_1.jpg`, label: "부산시민공원" },
  { src: `${TONG}02/3492402_image2_1.jpg`, label: "닥밭골 벽화마을" },
  { src: `${TONG}43/3589743_image2_1.jpg`, label: "금련산" },
];
