// GET /api/v1/events, /api/v1/events/{contentId} — 한국관광공사 TourAPI에 등록된 부산 축제·공연·전시
export interface BusanEvent {
  contentId: string;
  title: string;
  /** YYYY-MM-DD */
  eventStartDate: string;
  /** YYYY-MM-DD */
  eventEndDate: string;
  /** 경도 */
  mapX: number | null;
  /** 위도 */
  mapY: number | null;
  tel: string | null;
  addr1: string | null;
  addr2: string | null;
  firstImage: string | null;
  firstImage2: string | null;
  eventPlace: string | null;
  playTime: string | null;
  /** 이용 요금 — 여러 줄로 온다 */
  useTimeFestival: string | null;
  sponsor1: string | null;
  sponsor1Tel: string | null;
  sponsor2: string | null;
  sponsor2Tel: string | null;
  ageLimit: string | null;
  eventHomepage: string | null;
}
