const TOUR_IMAGE = /^https?:\/\/(tong\.visitkorea\.or\.kr\/cms\/resource\/.+)_image2_1(\.[a-z]+)$/i;

/**
 * 관광공사 사진 주소(`..._image2_1.jpg`, 가로 약 940px)를 큰 원본(`..._image1_1.jpg`, 가로 약 1,500px)으로 바꾼다.
 * 화면 너비 배너에 작은 사진을 늘리면 흐릿해져서 쓴다. 관광공사 사진 주소가 아니면 null.
 */
export function toLargeTourImage(src: string): string | null {
  const match = src.match(TOUR_IMAGE);
  return match ? `https://${match[1]}_image1_1${match[2]}` : null;
}

/** 배너 배경 사진 — 큰 원본을 먼저 쓰고, 없으면(404) 원래 사진으로 대신한다 */
export function toBackdropPhoto(src: string, label?: string): { src: string; fallbackSrc?: string; label?: string } {
  const large = toLargeTourImage(src);
  const original = src.replace(/^http:\/\//, "https://");
  return large ? { src: large, fallbackSrc: original, label } : { src: original, label };
}
