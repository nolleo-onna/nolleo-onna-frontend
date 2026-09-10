import { clientFetch } from "@/libs/clientFetch";

import type { ApiErrorResponse, ApiResponse } from "@/types/course";
import type {
  CommentCreateRequest,
  Page,
  PopularPost,
  PostCategoryTag,
  PostComment,
  PostDetail,
  PostDistrictTag,
  PostLikeToggleResult,
  PostSummary,
  PostWriteRequest,
} from "@/types/post";

/** 게시판 API 실패. errorCode는 백엔드 코드(PT001 등), 검증 실패면 fieldErrors가 채워진다. */
export class PostApiError extends Error {
  readonly status: number;
  readonly errorCode: string | null;
  readonly fieldErrors: Record<string, string>;

  constructor(
    message: string,
    status: number,
    errorCode: string | null = null,
    fieldErrors: Record<string, string> = {},
  ) {
    super(message);
    this.name = "PostApiError";
    this.status = status;
    this.errorCode = errorCode;
    this.fieldErrors = fieldErrors;
  }
}

async function throwApiError(res: Response, fallback: string): Promise<never> {
  const body = await res
    .json()
    .then((json: ApiErrorResponse | null) => json)
    .catch(() => null);
  const fieldErrors: Record<string, string> = {};
  for (const { field, message } of body?.errorList ?? []) {
    if (!fieldErrors[field]) fieldErrors[field] = message;
  }
  throw new PostApiError(
    body?.message ?? Object.values(fieldErrors)[0] ?? fallback,
    res.status,
    body?.errorCode ?? null,
    fieldErrors,
  );
}

async function unwrap<T>(res: Response, fallback: string): Promise<T> {
  if (!res.ok) await throwApiError(res, fallback);
  const json: ApiResponse<T> = await res.json();
  return json.data;
}

export interface FetchPostsParams {
  district?: PostDistrictTag;
  category?: PostCategoryTag;
  page?: number;
  size?: number;
}

// 게시글 목록 — 최신순, 서버 페이징(0부터). 비로그인도 조회 가능
export async function fetchPosts(params: FetchPostsParams = {}): Promise<Page<PostSummary>> {
  const query = new URLSearchParams();
  if (params.district) query.set("district", params.district);
  if (params.category) query.set("category", params.category);
  if (params.page !== undefined) query.set("page", String(params.page));
  if (params.size !== undefined) query.set("size", String(params.size));
  const qs = query.toString();
  const res = await clientFetch(`/api/v1/posts${qs ? `?${qs}` : ""}`);
  return unwrap(res, "게시글 목록을 불러오지 못했어요");
}

export async function fetchPopularPosts(): Promise<PopularPost[]> {
  const res = await clientFetch("/api/v1/posts/popular");
  return unwrap(res, "인기 글을 불러오지 못했어요");
}

// 단건 조회 — 서버가 조회수를 1 올린다
export async function fetchPost(postId: number): Promise<PostDetail> {
  const res = await clientFetch(`/api/v1/posts/${postId}`);
  return unwrap(res, "글을 불러오지 못했어요");
}

export async function createPost(body: PostWriteRequest): Promise<PostDetail> {
  const res = await clientFetch("/api/v1/posts", {
    method: "POST",
    body: JSON.stringify(body),
  });
  return unwrap(res, "글을 올리지 못했어요");
}

export async function updatePost(postId: number, body: PostWriteRequest): Promise<PostDetail> {
  const res = await clientFetch(`/api/v1/posts/${postId}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
  return unwrap(res, "글을 수정하지 못했어요");
}

export async function deletePost(postId: number): Promise<void> {
  const res = await clientFetch(`/api/v1/posts/${postId}`, { method: "DELETE" });
  if (!res.ok) await throwApiError(res, "글을 삭제하지 못했어요");
}

export async function togglePostLike(postId: number): Promise<PostLikeToggleResult> {
  const res = await clientFetch(`/api/v1/posts/${postId}/likes/toggle`, { method: "POST" });
  return unwrap(res, "좋아요를 반영하지 못했어요");
}

export async function reportPost(postId: number, reason: string): Promise<void> {
  const res = await clientFetch(`/api/v1/posts/${postId}/reports`, {
    method: "POST",
    body: JSON.stringify({ reason }),
  });
  if (!res.ok) await throwApiError(res, "신고를 접수하지 못했어요");
}

// 댓글 — 최상위 댓글만 페이지로 오고 답글은 각 댓글의 replies에 들어 있다
export async function fetchComments(
  postId: number,
  page = 0,
  size = 20,
): Promise<Page<PostComment>> {
  const res = await clientFetch(`/api/v1/posts/${postId}/comments?page=${page}&size=${size}`);
  return unwrap(res, "댓글을 불러오지 못했어요");
}

export async function createComment(body: CommentCreateRequest): Promise<PostComment> {
  const res = await clientFetch("/api/v1/comments", {
    method: "POST",
    body: JSON.stringify(body),
  });
  return unwrap(res, "댓글을 남기지 못했어요");
}

export async function deleteComment(commentId: number): Promise<void> {
  const res = await clientFetch(`/api/v1/comments/${commentId}`, { method: "DELETE" });
  if (!res.ok) await throwApiError(res, "댓글을 삭제하지 못했어요");
}

// 이미지 업로드 — multipart. 최대 5장, 각 10MB, jpg/png/webp
export async function uploadImages(files: File[]): Promise<string[]> {
  const form = new FormData();
  for (const file of files) form.append("images", file);
  const res = await clientFetch("/api/v1/images", { method: "POST", body: form });
  const data = await unwrap<{ imageUrls: string[] }>(res, "이미지를 올리지 못했어요");
  return data.imageUrls;
}
