import { describe, expect, it } from "vitest";

import { buildWeeklyBest } from "./weeklyBestFeed";

import type { Hankkut } from "@/features/hankkut/data/mockHankkut";
import type { PostSummary } from "@/types/post";

function curated(overrides: Partial<Hankkut>): Hankkut {
  return {
    id: 1,
    category: "오늘 행사",
    title: "큐레이션 글",
    summary: "요약",
    date: "2026.08.01",
    region: "해운대",
    imageUrl: "https://example.com/a.jpg",
    views: 0,
    ...overrides,
  };
}

function boardPost(overrides: Partial<PostSummary>): PostSummary {
  return {
    id: 1,
    title: "자유게시판 글",
    author: { nickname: "익명", profileImageUrl: null },
    categoryTags: ["CAFE"],
    districtTag: "HAEUNDAE_GU",
    hasImage: false,
    likeCount: 0,
    isLiked: false,
    viewCount: 0,
    commentCount: 0,
    createdAt: "2026-08-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("buildWeeklyBest", () => {
  it("큐레이션 글과 자유게시판 글을 합쳐서 조회수 순으로 정렬한다", () => {
    const result = buildWeeklyBest(
      [curated({ id: 1, title: "큐1", views: 10 })],
      [
        boardPost({ id: 1, title: "게시글1", viewCount: 50 }),
        boardPost({ id: 2, title: "게시글2", viewCount: 5 }),
      ],
    );

    expect(result.map((item) => item.title)).toEqual(["게시글1", "큐1", "게시글2"]);
  });

  it("자유게시판 글에는 자유게시판 배지를 붙이고 상세 경로로 잇는다", () => {
    const [item] = buildWeeklyBest([], [boardPost({ id: 7, viewCount: 1 })]);
    expect(item.badgeLabel).toBe("자유게시판");
    expect(item.href).toBe("/hankkut/post/7");
    expect(item.metaLabel).toBe("2026.08.01");
  });

  it("limit을 넘는 항목은 잘라낸다", () => {
    const board = Array.from({ length: 5 }, (_, i) =>
      boardPost({ id: i, title: `글${i}`, viewCount: i }),
    );
    expect(buildWeeklyBest([], board, 3)).toHaveLength(3);
  });

  it("입력이 비어있으면 빈 배열을 반환한다", () => {
    expect(buildWeeklyBest([], [])).toEqual([]);
  });
});
