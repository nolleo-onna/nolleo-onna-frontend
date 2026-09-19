/** 인기 스팟 카드 시안들이 같이 쓰는 값 — 지금 쓰는 티켓 카드와 같은 정보 */
export interface SpotCardProps {
  imageSrc: string;
  name: string;
  /** 지역 — "해운대구"처럼 구·군 이름 */
  location: string;
  rating: number;
  /** 무료이거나 값을 모르면 null */
  price?: number | null;
  /** 카드 순번 (0부터) */
  index: number;
  onClick?: () => void;
}

export const formatPrice = (price?: number | null) =>
  price === null || price === undefined ? "무료" : `${price.toLocaleString()}원`;
