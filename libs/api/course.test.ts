import { afterEach, describe, expect, it, vi } from "vitest";

import {
  CourseGenerateError,
  CourseUpdateError,
  fetchPopularCourses,
  fetchSharedCourse,
  generateCourse,
  toggleSharedCourseLike,
  updateCourse,
  updateCourseVisibility,
} from "./course";

import type { CourseGenerateRequest, CourseUpdateRequest } from "@/types/course";

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

describe("fetchPopularCourses", () => {
  it("size를 붙여 첫 페이지를 조회하고 data 배열을 돌려준다", async () => {
    const list = [{ shareToken: "t1", title: "코스", viewCount: 10 }];
    const fetchMock = mockFetch(200, { status: 200, message: "ok", data: list });

    await expect(fetchPopularCourses(6)).resolves.toEqual(list);
    expect(fetchMock.mock.calls[0][0]).toBe(
      "https://api.test.local/api/v1/courses/popular?page=0&size=6",
    );
  });

  it("전체보기에서 다음 쪽을 부를 수 있게 page도 붙인다", async () => {
    const fetchMock = mockFetch(200, { status: 200, message: "ok", data: [] });

    await fetchPopularCourses(12, 2);
    expect(fetchMock.mock.calls[0][0]).toBe(
      "https://api.test.local/api/v1/courses/popular?page=2&size=12",
    );
  });

  it("백엔드에 아직 API가 없어 404·401·403이면 빈 목록으로 다룬다", async () => {
    for (const status of [404, 401, 403]) {
      const fetchMock = mockFetch(status, { status, errorCode: "UNAUTHORIZED" });
      await expect(fetchPopularCourses()).resolves.toEqual([]);
      // 로그인 리다이렉트도, 재발급 호출도 없어야 한다
      expect(fetchMock).toHaveBeenCalledTimes(1);
    }
  });
});

describe("toggleSharedCourseLike", () => {
  it("공유 토큰으로 POST 하고 liked·likeCount를 돌려준다", async () => {
    const fetchMock = mockFetch(200, { status: 200, message: "ok", data: { liked: true, likeCount: 3 } });

    await expect(toggleSharedCourseLike("tok-1")).resolves.toEqual({ liked: true, likeCount: 3 });
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://api.test.local/api/v1/courses/shared/tok-1/likes/toggle");
    expect(init.method).toBe("POST");
  });
});

describe("generateCourse", () => {
  const form: CourseGenerateRequest = { startArea: "센텀", budget: "NONE" };

  it("POST /courses로 폼을 보내고 data를 돌려준다", async () => {
    const result = { pairId: "p1", courses: [], applied: {}, unmatched: {} };
    const fetchMock = mockFetch(200, { status: 200, message: "ok", data: result });

    await expect(generateCourse(form)).resolves.toEqual(result);

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://api.test.local/api/v1/courses");
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body)).toEqual(form);
  });

  it("아는 errorCode는 우리 문구로 바꾼다", async () => {
    mockFetch(400, { status: 400, errorCode: "UNKNOWN_START_AREA", message: "unsupported area" });

    await expect(generateCourse(form)).rejects.toMatchObject({
      status: 400,
      errorCode: "UNKNOWN_START_AREA",
      message: expect.stringContaining("다른 지역"),
    });
  });

  it("엔드포인트가 아직 배포되지 않아 404가 오면 서버 원문 대신 준비 중 안내를 보여준다", async () => {
    // 스프링이 매핑을 못 찾으면 이 문구를 404로 내려준다 — 그대로 노출되면 사용자가 자기 입력 탓을 한다
    mockFetch(404, { status: 404, message: "No static resource api/v1/courses." });

    const error = await generateCourse(form).catch((e: unknown) => e);

    expect(error).toBeInstanceOf(CourseGenerateError);
    expect((error as CourseGenerateError).message).not.toContain("static resource");
    expect((error as CourseGenerateError).message).toContain("준비되지 않았어요");
  });

  it("5xx도 서버 원문을 노출하지 않는다", async () => {
    mockFetch(500, { status: 500, message: "NullPointerException at CourseService.java:142" });

    const error = await generateCourse(form).catch((e: unknown) => e);

    expect((error as CourseGenerateError).message).not.toContain("NullPointerException");
    expect((error as CourseGenerateError).message).toContain("서버에 문제");
  });

  it("에러 응답이 JSON이 아니어도 우리 문구로 떨어진다", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        status: 502,
        ok: false,
        json: async () => {
          throw new Error("not json");
        },
      }),
    );
    vi.stubGlobal("window", { location: { pathname: "/", search: "", href: "" } });

    await expect(generateCourse(form)).rejects.toMatchObject({
      status: 502,
      errorCode: "UNKNOWN",
      message: expect.stringContaining("서버에 문제"),
    });
  });
});
