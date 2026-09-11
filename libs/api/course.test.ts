import { afterEach, describe, expect, it, vi } from "vitest";

import { CourseUpdateError, fetchSharedCourse, updateCourse, updateCourseVisibility } from "./course";

import type { CourseUpdateRequest } from "@/types/course";

const body: CourseUpdateRequest = {
  title: "광안리 바다 산책",
  description: "바다를 따라 걷는 코스",
  items: [{ placeType: "SPOT", originalId: "2760699" }],
};

function mockFetch(status: number, json: unknown) {
  const fetchMock = vi
    .fn()
    .mockResolvedValue({ status, ok: status < 400, json: async () => json });
  vi.stubGlobal("fetch", fetchMock);
  vi.stubGlobal("window", { location: { pathname: "/course", search: "", href: "" } });
  return fetchMock;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("updateCourse", () => {
  it("PUT /courses/{courseId}로 제목·소개·스팟을 한 번에 보내고 data를 돌려준다", async () => {
    const updated = { id: 7, title: body.title, items: [] };
    const fetchMock = mockFetch(200, { status: 200, message: "ok", data: updated });

    await expect(updateCourse(7, body)).resolves.toEqual(updated);

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://api.test.local/api/v1/courses/7");
    expect(init.method).toBe("PUT");
    expect(JSON.parse(init.body)).toEqual(body);
  });

  it("검증 실패(errorList)는 필드별 오류로 바꾸고 items 하위 오류는 items 하나로 모은다", async () => {
    mockFetch(400, {
      status: 400,
      errorCode: "INVALID_INPUT_VALUE",
      errorList: [
        { field: "title", message: "코스 제목은 필수입니다." },
        { field: "items[1].originalId", message: "originalId는 필수입니다." },
        { field: "items", message: "방문 스팟은 최대 15개까지 담을 수 있습니다." },
      ],
    });

    const error = await updateCourse(7, body).catch((e: unknown) => e);

    expect(error).toBeInstanceOf(CourseUpdateError);
    expect((error as CourseUpdateError).status).toBe(400);
    expect((error as CourseUpdateError).fieldErrors).toEqual({
      title: "코스 제목은 필수입니다.",
      items: "originalId는 필수입니다.",
    });
  });

  it("409는 다른 곳에서 먼저 저장됐다는 안내로 바꾼다", async () => {
    mockFetch(409, { status: 409, errorCode: "CONCURRENT_MODIFICATION", message: "conflict" });

    await expect(updateCourse(7, body)).rejects.toMatchObject({
      status: 409,
      message: expect.stringContaining("먼저 저장된"),
      fieldErrors: {},
    });
  });

  it("그 외 실패는 서버 message를 그대로 쓴다", async () => {
    mockFetch(400, {
      status: 400,
      errorCode: "COURSE_PLACE_NOT_FOUND",
      message: "코스에 넣을 수 없는 장소가 있습니다.",
    });

    await expect(updateCourse(7, body)).rejects.toThrow(
      "코스에 넣을 수 없는 장소가 있습니다.",
    );
  });
});

describe("updateCourseVisibility / fetchSharedCourse", () => {
  it("PATCH /courses/{id}/visibility 에 목표 상태를 보내고 share가 담긴 코스를 돌려준다", async () => {
    const updated = { id: 7, share: { isPublic: true, shareToken: "abc", viewCount: 0, likeCount: 0 } };
    const fetchMock = mockFetch(200, { status: 200, message: "ok", data: updated });

    await expect(updateCourseVisibility(7, true)).resolves.toEqual(updated);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://api.test.local/api/v1/courses/7/visibility");
    expect(init.method).toBe("PATCH");
    expect(JSON.parse(init.body)).toEqual({ isPublic: true });
  });

  it("공유 토큰 조회는 404면 코스를 찾을 수 없다는 오류를 던진다", async () => {
    mockFetch(404, { status: 404, errorCode: "COURSE_NOT_FOUND", message: "코스를 찾을 수 없습니다." });

    await expect(fetchSharedCourse("nope")).rejects.toMatchObject({ status: 404 });
  });
});
