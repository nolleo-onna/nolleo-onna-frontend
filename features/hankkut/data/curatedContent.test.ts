import { describe, expect, it } from "vitest";

import { HANKKUT_GALLERIES, getPostsForGallery, matchGallerySlug } from "./galleries";
import { getHankkutDetail } from "./hankkutDetail";
import { MOCK_HANKKUT_LIST } from "./mockHankkut";

describe("큐레이션 한끗 데이터", () => {
  it("id가 겹치지 않는다", () => {
    const ids = MOCK_HANKKUT_LIST.map((item) => item.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("'부산 전체' 글을 빼면 모두 어느 동네 갤러리에 속한다", () => {
    const orphans = MOCK_HANKKUT_LIST.filter(
      (item) => item.region !== "부산 전체" && matchGallerySlug(item.region) === null,
    );
    expect(orphans.map((item) => item.title)).toEqual([]);
  });

  it("모든 동네에 큐레이션 글이 2개 이상 있다", () => {
    const thin = HANKKUT_GALLERIES.filter((gallery) => getPostsForGallery(gallery.slug).length < 2).map(
      (gallery) => gallery.slug,
    );
    expect(thin).toEqual([]);
  });

  it("모든 글에 전용 상세 본문이 있고, 사진은 한국관광공사 이미지다", () => {
    for (const item of MOCK_HANKKUT_LIST) {
      const detail = getHankkutDetail(item.id);
      expect(detail?.content.startsWith("부산 여행을 더 알차게"), `${item.id}번 글이 기본 문구다`).toBe(false);
      expect(new URL(item.imageUrl).hostname).toBe("tong.visitkorea.or.kr");
    }
  });

  it("행사로 이어지는 글은 관광공사 contentId(숫자)를 갖는다", () => {
    const linked = MOCK_HANKKUT_LIST.map((item) => getHankkutDetail(item.id)?.eventContentId).filter(Boolean);
    expect(linked.length).toBeGreaterThan(0);
    for (const id of linked) expect(id).toMatch(/^\d+$/);
  });
});
