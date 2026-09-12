import { afterEach, describe, expect, it, vi } from "vitest";

import { clientFetch } from "./clientFetch";

function stubWindow(pathname: string) {
  const win = {
    location: { pathname, search: "", href: "" },
  };
  vi.stubGlobal("window", win);
  return win;
}

function mockFetch(status: number) {
  const fetchMock = vi.fn().mockResolvedValue({ status, ok: status < 400 });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("clientFetch", () => {
  it("API_URL과 엔드포인트를 합치고 기본 헤더·credentials를 붙인다", async () => {
    stubWindow("/spot");
    const fetchMock = mockFetch(200);

    await clientFetch("/api/v1/spots", { method: "POST", body: "{}" });

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.test.local/api/v1/spots",
      expect.objectContaining({
        method: "POST",
        body: "{}",
        credentials: "include",
        headers: expect.objectContaining({ "Content-Type": "application/json" }),
      }),
    );
  });

  it("401을 받으면 returnUrl과 함께 로그인 페이지로 리다이렉트한다", async () => {
    const win = stubWindow("/course");
    mockFetch(401);

    await clientFetch("/api/v1/courses/chat");

    expect(win.location.href).toBe("/login?notice=session&returnUrl=%2Fcourse");
  });

  it("이미 로그인 페이지에 있으면 401이어도 리다이렉트하지 않는다", async () => {
    const win = stubWindow("/login");
    mockFetch(401);

    await clientFetch("/api/v1/auth/me");

    expect(win.location.href).toBe("");
  });

  it("401이면 refresh를 한 번 호출하고 성공 시 원래 요청을 다시 보낸다", async () => {
    const win = stubWindow("/mypage");
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ status: 401, ok: false }) // 원래 요청
      .mockResolvedValueOnce({ status: 200, ok: true }) // refresh
      .mockResolvedValueOnce({ status: 200, ok: true }); // 재시도
    vi.stubGlobal("fetch", fetchMock);

    const res = await clientFetch("/api/v1/courses/me");

    expect(res.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(fetchMock.mock.calls[1][0]).toBe("https://api.test.local/api/v1/auth/refresh");
    expect(fetchMock.mock.calls[1][1]).toMatchObject({ method: "POST", credentials: "include" });
    expect(fetchMock.mock.calls[2][0]).toBe("https://api.test.local/api/v1/courses/me");
    expect(win.location.href).toBe("");
  });

  it("refresh까지 실패하면 재시도 없이 로그인 페이지로 보낸다", async () => {
    const win = stubWindow("/mypage");
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ status: 401, ok: false })
      .mockResolvedValueOnce({ status: 401, ok: false });
    vi.stubGlobal("fetch", fetchMock);

    await clientFetch("/api/v1/courses/me");

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(win.location.href).toBe("/login?notice=session&returnUrl=%2Fmypage");
  });

  it("publicEndpoint 요청은 401이어도 재발급·리다이렉트 없이 응답을 그대로 돌려준다", async () => {
    const win = stubWindow("/");
    const fetchMock = mockFetch(401);

    const res = await clientFetch("/api/v1/courses/popular", { publicEndpoint: true });

    expect(res.status).toBe(401);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(win.location.href).toBe("");
  });

  it("401이 아니면 리다이렉트하지 않는다", async () => {
    const win = stubWindow("/spot");
    mockFetch(200);

    await clientFetch("/api/v1/spots");

    expect(win.location.href).toBe("");
  });
});
