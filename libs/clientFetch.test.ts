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

  it("401이 아니면 리다이렉트하지 않는다", async () => {
    const win = stubWindow("/spot");
    mockFetch(200);

    await clientFetch("/api/v1/spots");

    expect(win.location.href).toBe("");
  });
});
