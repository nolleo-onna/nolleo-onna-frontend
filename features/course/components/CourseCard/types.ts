/** 공개 코스 카드 시안들이 같이 쓰는 값 — PopularCourse에서 카드에 필요한 것만 */
export interface CourseCardProps {
  /** 조회수 순위 (1부터). 인기순이 아닐 때는 넘기지 않는다 */
  rank?: number;
  imageSrc: string | null;
  title: string;
  authorNickname: string | null;
  viewCount: number;
  likeCount: number;
  totalCost: number | null;
  /** 방문 순서대로의 장소 이름 */
  stops: string[];
}
