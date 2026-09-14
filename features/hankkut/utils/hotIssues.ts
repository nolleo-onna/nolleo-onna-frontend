import { POST_CATEGORY_LABELS } from "@/features/hankkut/constants/postTags";
import { maskName } from "@/features/hankkut/utils/maskName";
import {
  formatEventPeriod,
  getEventBadge,
  sortActiveEvents,
} from "@/features/event/utils/eventSchedule";

import type { EventBadge } from "@/features/event/utils/eventSchedule";
import type { Hankkut } from "@/features/hankkut/data/mockHankkut";
import type { BusanEvent } from "@/types/event";
import type { PostSummary } from "@/types/post";

export interface HotIssueEvent {
  kind: "event";
  key: string;
  href: string;
  title: string;
  imageUrl: string | null;
  badge: EventBadge;
  period: string;
  place: string | null;
}

export interface HotIssuePost {
  kind: "post";
  key: string;
  href: string;
  title: string;
  authorName: string;
  tagLabel: string | null;
  viewCount: number;
  commentCount: number;
}

export interface HotIssueCurated {
  kind: "curated";
  key: string;
  href: string;
  title: string;
  imageUrl: string;
  category: string;
}

export type HotIssueItem = HotIssueEvent | HotIssuePost | HotIssueCurated;

export const HOT_ISSUE_LIMIT = 3;

/** 조회수 → 좋아요 → 최신 순 */
export function sortByPopularity<T extends Pick<PostSummary, "viewCount" | "likeCount" | "createdAt">>(
  posts: T[],
): T[] {
  return [...posts].sort(
    (a, b) =>
      b.viewCount - a.viewCount ||
      b.likeCount - a.likeCount ||
      b.createdAt.localeCompare(a.createdAt),
  );
}

/**
 * 동네 핫이슈 카드 — 지금 갈 수 있는 이 동네 행사를 먼저 놓고 남는 자리는 인기글로 채운다.
 * 글이 하나라도 있으면 한 칸은 글 몫으로 남겨, 행사가 많은 동네에서도 커뮤니티가 묻히지 않게 한다.
 * 행사도 글도 모자란 동네(서면처럼 행사가 없는 곳)는 큐레이션 한끗을 조회수순으로 채워 줄이 비지 않게 한다.
 * 게시글 목록 응답엔 이미지 URL이 없어 글은 텍스트 카드로 그린다.
 */
export function buildHotIssues(
  regionEvents: BusanEvent[],
  recentPosts: PostSummary[],
  today: string,
  curated: Hankkut[] = [],
  limit = HOT_ISSUE_LIMIT,
): HotIssueItem[] {
  const eventSlots = recentPosts.length > 0 ? limit - 1 : limit;

  const events: HotIssueItem[] = sortActiveEvents(regionEvents, today)
    .slice(0, eventSlots)
    .map((event) => ({
      kind: "event",
      key: `event-${event.contentId}`,
      href: `/event/${encodeURIComponent(event.contentId)}`,
      title: event.title,
      imageUrl: event.firstImage,
      badge: getEventBadge(event, today),
      period: formatEventPeriod(event.eventStartDate, event.eventEndDate),
      place: event.eventPlace,
    }));

  const posts: HotIssueItem[] = sortByPopularity(recentPosts)
    .slice(0, limit - events.length)
    .map((post) => ({
      kind: "post",
      key: `post-${post.id}`,
      href: `/hankkut/post/${post.id}`,
      title: post.title,
      authorName: maskName(post.author.nickname),
      tagLabel: post.categoryTags[0] ? POST_CATEGORY_LABELS[post.categoryTags[0]] : null,
      viewCount: post.viewCount,
      commentCount: post.commentCount,
    }));

  const filled = [...events, ...posts];
  const extras: HotIssueItem[] = [...curated]
    .sort((a, b) => b.views - a.views)
    .slice(0, limit - filled.length)
    .map((item) => ({
      kind: "curated",
      key: `curated-${item.id}`,
      href: `/hankkut/${item.id}`,
      title: item.title,
      imageUrl: item.imageUrl,
      category: item.category,
    }));

  return [...filled, ...extras];
}
