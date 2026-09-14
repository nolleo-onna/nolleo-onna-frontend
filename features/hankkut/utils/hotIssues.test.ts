import { describe, expect, it } from "vitest";

import { buildHotIssues, sortByPopularity } from "./hotIssues";

import type { BusanEvent } from "@/types/event";
import type { PostSummary } from "@/types/post";

const TODAY = "2026-09-14";

function event(contentId: string, eventStartDate: string, eventEndDate: string): BusanEvent {
  return {
    contentId,
    title: `행사 ${contentId}`,
    eventStartDate,
    eventEndDate,
    mapX: null,
    mapY: null,
    tel: null,
    addr1: "부산광역시 해운대구",
    addr2: null,
    firstImage: null,
    firstImage2: null,
    eventPlace: null,
    playTime: null,
    useTimeFestival: null,
    sponsor1: null,
    sponsor1Tel: null,
    sponsor2: null,
    sponsor2Tel: null,
    ageLimit: null,
    eventHomepage: null,
  };
}

function post(id: number, viewCount: number, overrides: Partial<PostSummary> = {}): PostSummary {
  return {
    id,
    title: `글 ${id}`,
    author: { nickname: "박민성", profileImageUrl: null },
    categoryTags: ["CAFE"],
    districtTag: "HAEUNDAE_GU",
    hasImage: false,
    likeCount: 0,
    isLiked: false,
    viewCount,
    commentCount: 0,
    createdAt: "2026-09-10T00:00:00.000Z",
    ...overrides,
  };
}

describe("buildHotIssues", () => {
  const events = [
    event("ended", "2026-08-01", "2026-08-02"),
    event("later", "2026-10-02", "2026-10-04"),
    event("ongoing", "2026-09-04", "2026-09-19"),
    event("soon", "2026-09-15", "2026-09-16"),
  ];

  it("글이 있으면 한 칸은 글에 남기고, 행사는 진행 중 → 곧 시작 순, 종료는 뺀다", () => {
    const items = buildHotIssues(events, [post(1, 5), post(2, 40)], TODAY);
    expect(items.map((i) => i.key)).toEqual(["event-ongoing", "event-soon", "post-2"]);
  });

  it("글이 없으면 행사로 세 칸을 채운다", () => {
    const items = buildHotIssues(events, [], TODAY);
    expect(items.map((i) => i.key)).toEqual(["event-ongoing", "event-soon", "event-later"]);
  });

  it("행사가 없으면 인기글로 채우고, 글 카드엔 가린 닉네임과 첫 태그를 쓴다", () => {
    const items = buildHotIssues([], [post(1, 3), post(2, 9), post(3, 1), post(4, 7)], TODAY);
    expect(items.map((i) => i.key)).toEqual(["post-2", "post-4", "post-1"]);
    expect(items[0]).toMatchObject({ kind: "post", authorName: "박x성", tagLabel: "카페" });
  });
});

describe("sortByPopularity", () => {
  it("조회수가 같으면 좋아요, 그것도 같으면 최신 글이 먼저", () => {
    const sorted = sortByPopularity([
      post(1, 10, { likeCount: 1, createdAt: "2026-09-01T00:00:00Z" }),
      post(2, 10, { likeCount: 3 }),
      post(3, 10, { likeCount: 1, createdAt: "2026-09-12T00:00:00Z" }),
      post(4, 20),
    ]);
    expect(sorted.map((p) => p.id)).toEqual([4, 2, 3, 1]);
  });
});
