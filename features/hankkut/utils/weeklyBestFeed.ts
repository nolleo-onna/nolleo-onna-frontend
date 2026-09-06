import type { Hankkut } from "@/features/hankkut/data/mockHankkut";
import type { HankkutPost } from "@/features/hankkut/hooks/useHankkutPosts";

/** 큐레이션 한끗과 자유게시판 글을 같은 카드로 보여주기 위한 공통 모양 */
export interface WeeklyBestItem {
  key: string;
  href: string;
  title: string;
  summary?: string;
  imageUrl?: string;
  badgeLabel: string;
  badgeClassName: string;
  /** 카드 하단 좌측 메타(날짜) */
  metaLabel: string;
  views: number;
}

const CATEGORY_BADGE_STYLES: Record<Hankkut["category"], string> = {
  "오늘 행사": "bg-pink-500 text-white",
  "무료로 즐기기": "bg-lime-300 text-navy-900",
  "할인 혜택 팁": "bg-navy-900 text-lime-300",
};

const BOARD_BADGE_CLASS = "bg-ocean-500 text-white";

function formatBoardDate(iso: string): string {
  const date = new Date(iso);
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(
    date.getDate()
  ).padStart(2, "0")}`;
}

/**
 * "이번 주 베스트"는 큐레이션 한끗과 자유게시판 글을 합쳐 조회수 순으로 보여준다.
 * 이전엔 큐레이션 글만 대상이라, 자유게시판 글이 아무리 많아도(시드 데이터 포함)
 * 베스트에 안 잡혀서 카드 수가 안 채워지는 문제가 있었다.
 */
export function buildWeeklyBest(
  curated: Hankkut[],
  board: HankkutPost[],
  limit = 9
): WeeklyBestItem[] {
  const curatedItems: WeeklyBestItem[] = curated.map((hankkut) => ({
    key: `mock-${hankkut.id}`,
    href: `/hankkut/${hankkut.id}`,
    title: hankkut.title,
    summary: hankkut.summary,
    imageUrl: hankkut.imageUrl,
    badgeLabel: hankkut.category,
    badgeClassName: CATEGORY_BADGE_STYLES[hankkut.category],
    metaLabel: hankkut.date,
    views: hankkut.views,
  }));

  const boardItems: WeeklyBestItem[] = board.map((post) => ({
    key: `board-${post.id}`,
    href: `/hankkut/post/${post.id}`,
    title: post.title,
    summary: post.content,
    imageUrl: post.imageDataUrl,
    badgeLabel: "자유게시판",
    badgeClassName: BOARD_BADGE_CLASS,
    metaLabel: formatBoardDate(post.createdAt),
    views: post.views,
  }));

  return [...curatedItems, ...boardItems]
    .sort((a, b) => b.views - a.views)
    .slice(0, limit);
}
