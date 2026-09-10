import { afterEach, describe, expect, it, vi } from "vitest";

import { PostApiError, createPost, fetchPosts, uploadImages } from "./posts";

function mockFetch(status: number, json: unknown) {
  const fetchMock = vi
    .fn()
    .mockResolvedValue({ status, ok: status < 400, json: async () => json });
  vi.stubGlobal("fetch", fetchMock);
  vi.stubGlobal("window", { location: { pathname: "/hankkut", search: "", href: "" } });
  return fetchMock;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("fetchPosts", () => {
  it("구·페이지를 쿼리스트링으로 보내고 Page를 돌려준다", async () => {
    const page = { content: [], totalElements: 0, totalPages: 0, number: 0, size: 10, first: true, last: true };
    const fetchMock = mockFetch(200, { status: 200, message: "ok", data: page });

    await expect(fetchPosts({ district: "HAEUNDAE_GU", page: 2, size: 10 })).resolves.toEqual(page);
    expect(fetchMock.mock.calls[0][0]).toBe(
      "https://api.test.local/api/v1/posts?district=HAEUNDAE_GU&page=2&size=10",
    );
  });
});

describe("createPost", () => {
  it("검증 실패는 errorList를 필드별 오류로 담은 PostApiError로 던진다", async () => {
    mockFetch(400, {
      status: 400,
      errorCode: "INVALID_INPUT_VALUE",
      errorList: [{ field: "categoryTags", message: "크기가 1에서 10 사이여야 합니다" }],
    });

    const error = await createPost({ title: "t", content: "c", categoryTags: [] }).catch((e: unknown) => e);

    expect(error).toBeInstanceOf(PostApiError);
    expect((error as PostApiError).status).toBe(400);
    expect((error as PostApiError).fieldErrors.categoryTags).toContain("1에서 10");
  });

  it("도메인 오류는 서버 message와 errorCode를 그대로 싣는다", async () => {
    mockFetch(403, { status: 403, errorCode: "PT002", message: "게시글에 대한 권한이 없습니다." });

    await expect(createPost({ title: "t", content: "c", categoryTags: ["CAFE"] })).rejects.toMatchObject({
      status: 403,
      errorCode: "PT002",
      message: "게시글에 대한 권한이 없습니다.",
    });
  });
});

describe("uploadImages", () => {
  it("FormData로 보내며 JSON Content-Type을 붙이지 않는다", async () => {
    const fetchMock = mockFetch(200, { status: 200, message: "ok", data: { imageUrls: ["https://cdn/a.jpg"] } });
    const file = new File(["x"], "a.jpg", { type: "image/jpeg" });

    await expect(uploadImages([file])).resolves.toEqual(["https://cdn/a.jpg"]);

    const [, init] = fetchMock.mock.calls[0];
    expect(init.body).toBeInstanceOf(FormData);
    expect(init.headers).not.toHaveProperty("Content-Type");
    expect(init.body.getAll("images")).toHaveLength(1);
  });
});
