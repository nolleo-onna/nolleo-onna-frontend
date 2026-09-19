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

describe("buildHotIssues — 글 사진", () => {
  it("사진이 있는 글은 카드에 그 사진을 쓴다", () => {
    const thumbnails = new Map([[7, "https://storage.googleapis.com/nolleo-onna-images/posts/a.png"]]);
    const items = buildHotIssues([], [post(7, 10, { hasImage: true })], TODAY, [], 3, thumbnails);
    const card = items.find((item) => item.kind === "post");

    expect(card).toBeDefined();
    expect(card?.kind === "post" && card.imageUrl).toBe(
      "https://storage.googleapis.com/nolleo-onna-images/posts/a.png",
    );
  });

  it("사진이 없으면 null — 글자 카드로 그린다", () => {
    const items = buildHotIssues([], [post(8, 10)], TODAY);
    const card = items.find((item) => item.kind === "post");

    expect(card?.kind === "post" && card.imageUrl).toBeNull();
  });
});

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

  it("행사·글로 칸이 남으면 큐레이션 한끗을 조회수순으로 채우고, 칸이 차 있으면 넣지 않는다", () => {
    const curated = [
      { id: 10, category: "무료로 즐기기" as const, title: "골목 산책", summary: "", date: "", region: "서면", imageUrl: "https://a/1.jpg", views: 100 },
      { id: 11, category: "할인 혜택 팁" as const, title: "시장 할인", summary: "", date: "", region: "서면", imageUrl: "https://a/2.jpg", views: 900 },
    ];
    const items = buildHotIssues([event("ongoing", "2026-09-04", "2026-09-19")], [], TODAY, curated);
    expect(items.map((i) => i.key)).toEqual(["event-ongoing", "curated-11", "curated-10"]);
    expect(items[1]).toMatchObject({ kind: "curated", href: "/hankkut/11", category: "할인 혜택 팁" });

    expect(buildHotIssues(events, [], TODAY, curated).map((i) => i.kind)).toEqual(["event", "event", "event"]);
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
