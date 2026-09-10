// 한끗 자유게시판 — 백엔드 Post / Comment / Image API 타입

export const POST_CATEGORY_TAGS = [
  "CAFE", "RESTAURANT", "EXHIBITION", "NATURE", "HISTORY", "ACTIVITY", "LEISURE",
  "FESTIVAL", "MARKET", "TOURIST_SPOT", "NIGHT_VIEW", "DRIVE", "DATE", "FAMILY",
  "SOLO", "PET",
] as const;
export type PostCategoryTag = (typeof POST_CATEGORY_TAGS)[number];

export const POST_DISTRICT_TAGS = [
  "JUNG_GU", "SEO_GU", "DONG_GU", "YEONGDO_GU", "BUSANJIN_GU", "DONGNAE_GU", "NAM_GU",
  "BUK_GU", "HAEUNDAE_GU", "SAHA_GU", "GEUMJEONG_GU", "GANGSEO_GU", "YEONJE_GU",
  "SUYEONG_GU", "SASANG_GU", "GIJANG_GUN",
] as const;
export type PostDistrictTag = (typeof POST_DISTRICT_TAGS)[number];

// 서버 검증 규칙과 같은 값
export const POST_CATEGORY_MIN = 1;
export const POST_CATEGORY_MAX = 10;
export const POST_IMAGE_MAX = 5;
export const POST_IMAGE_MAX_BYTES = 10 * 1024 * 1024;

export interface PostAuthor {
  nickname: string;
  profileImageUrl: string | null;
}

// GET /api/v1/posts 목록 아이템
export interface PostSummary {
  id: number;
  title: string;
  author: PostAuthor;
  categoryTags: PostCategoryTag[];
  districtTag: PostDistrictTag | null;
  hasImage: boolean;
  likeCount: number;
  isLiked: boolean;
  viewCount: number;
  commentCount: number;
  createdAt: string;
}

// GET /api/v1/posts/{postId}, POST/PATCH 응답
export interface PostDetail {
  id: number;
  title: string;
  content: string;
  author: PostAuthor;
  categoryTags: PostCategoryTag[];
  districtTag: PostDistrictTag | null;
  imageUrls: string[];
  likeCount: number;
  isLiked: boolean;
  viewCount: number;
  commentCount: number;
  createdAt: string;
  updatedAt: string | null;
}

// GET /api/v1/posts/popular
export interface PopularPost {
  id: number;
  title: string;
  thumbnailImageUrl: string | null;
  likeCount: number;
  isLiked: boolean;
}

// POST /api/v1/posts, PATCH /api/v1/posts/{postId} 본문
export interface PostWriteRequest {
  title: string;
  content: string;
  categoryTags: PostCategoryTag[];
  districtTag?: PostDistrictTag;
  imageUrls?: string[];
}

export interface PostLikeToggleResult {
  postId: number;
  isLiked: boolean;
  likeCount: number;
}

// 댓글 — 목록은 최상위 댓글만 페이지로 오고, 답글은 replies에 중첩된다
export interface PostComment {
  id: number;
  author: PostAuthor;
  content: string;
  /** 삭제된 댓글은 자리만 남고 내용은 비어 온다 */
  deleted: boolean;
  parentCommentId: number | null;
  replies: PostComment[];
  createdAt: string;
  updatedAt: string | null;
}

export interface CommentCreateRequest {
  postId: number;
  parentCommentId?: number;
  content: string;
}

// Spring Page 응답에서 화면이 쓰는 부분만
export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
}
