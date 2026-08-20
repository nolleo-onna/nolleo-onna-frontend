import { MOCK_HANKKUT_LIST } from "@/features/hankkut/data/mockHankkut";

import type { Hankkut } from "@/features/hankkut/data/mockHankkut";

export interface HankkutGallery {
  slug: string;
  name: string;
  /** 카드에 붙는 짧은 소개 문구 */
  tagline: string;
  emoji: string;
  /** 이 갤러리로 묶이는 게시글의 region 문자열들(부분 일치) */
  regionKeywords: string[];
}

// 한끗 글의 region 필드는 자유 문자열("광안리", "센텀·남포" 등)이라, 행정구역이
// 아니라 실제 놀거리가 몰린 "동네" 단위로 갤러리를 큐레이션한다. 새 지역이
// 늘어나면 여기에 갤러리 하나만 추가하면 된다.
export const HANKKUT_GALLERIES: HankkutGallery[] = [
  {
    slug: "haeundae",
    name: "해운대",
    tagline: "부산의 얼굴, 해변·야경·축제",
    emoji: "🏖️",
    regionKeywords: ["해운대"],
  },
  {
    slug: "gwangalli",
    name: "광안리",
    tagline: "드론쇼·야시장·바다뷰 카페",
    emoji: "🌉",
    regionKeywords: ["광안리", "민락"],
  },
  {
    slug: "seomyeon",
    name: "서면",
    tagline: "쇼핑·맛집·번화가",
    emoji: "🏙️",
    regionKeywords: ["서면", "전포"],
  },
  {
    slug: "nampo",
    name: "남포·원도심",
    tagline: "자갈치·국제시장·근대 골목",
    emoji: "🐟",
    regionKeywords: ["남포", "원도심", "자갈치", "센텀"],
  },
  {
    slug: "yeongdo",
    name: "영도",
    tagline: "흰여울마을·카페거리",
    emoji: "🌊",
    regionKeywords: ["영도"],
  },
  {
    slug: "saha",
    name: "사하·을숙도",
    tagline: "낙동강 생태·미술관",
    emoji: "🦆",
    regionKeywords: ["사하", "을숙도", "다대포"],
  },
  {
    slug: "gijang",
    name: "기장·송정",
    tagline: "이기대·해변 드라이브",
    emoji: "🚗",
    regionKeywords: ["기장", "송정"],
  },
];

/** 글의 region 문자열이 어느 갤러리에 속하는지 판정. 매칭 실패 시 null. */
export function matchGallerySlug(region: string): string | null {
  const gallery = HANKKUT_GALLERIES.find((g) =>
    g.regionKeywords.some((keyword) => region.includes(keyword))
  );
  return gallery?.slug ?? null;
}

export function getGalleryBySlug(slug: string): HankkutGallery | undefined {
  return HANKKUT_GALLERIES.find((g) => g.slug === slug);
}

export function getPostsForGallery(slug: string): Hankkut[] {
  return MOCK_HANKKUT_LIST.filter((post) => matchGallerySlug(post.region) === slug);
}

/** 갤러리 카드에 쓸 통계 — 글 수, 대표 이미지(최신글), 이번 주 1위 글 제목 */
export function getGallerySummary(slug: string) {
  const posts = getPostsForGallery(slug);
  const top = [...posts].sort((a, b) => b.views - a.views)[0];
  return {
    postCount: posts.length,
    coverImage: posts[0]?.imageUrl,
    topPostTitle: top?.title,
  };
}

const WEEKLY_BEST_LIMIT = 9;

/** 갤러리 상세 페이지의 "이번 주 베스트" — 조회수 기준 상위 N개 */
export function getWeeklyBestForGallery(slug: string, limit = WEEKLY_BEST_LIMIT): Hankkut[] {
  return [...getPostsForGallery(slug)]
    .sort((a, b) => b.views - a.views)
    .slice(0, limit);
}
