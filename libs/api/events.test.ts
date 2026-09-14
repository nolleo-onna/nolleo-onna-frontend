import { afterEach, describe, expect, it, vi } from "vitest";

import { EventNotFoundError, fetchEvent, fetchEvents } from "./events";

function mockFetch(status: number, json: unknown) {
  const fetchMock = vi
    .fn()
    .mockResolvedValue({ status, ok: status < 400, json: async () => json });
  vi.stubGlobal("fetch", fetchMock);
  const win = { location: { pathname: "/", search: "", href: "" } };
  vi.stubGlobal("window", win);
  return { fetchMock, win };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("fetchEvents", () => {
  it("행사 목록 data 배열을 돌려준다", async () => {
    const list = [{ contentId: "1", title: "행사" }];
    const { fetchMock } = mockFetch(200, { status: 200, message: "ok", data: list });

    await expect(fetchEvents()).resolves.toEqual(list);
    expect(fetchMock.mock.calls[0][0]).toBe("https://api.test.local/api/v1/events");
  });

  it("공개 API라 401이 와도 로그인 페이지로 보내지 않는다", async () => {
    const { fetchMock, win } = mockFetch(401, { status: 401 });

    await expect(fetchEvents()).rejects.toThrow();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(win.location.href).toBe("");
  });
});

describe("fetchEvent", () => {
  it("없는 행사는 EventNotFoundError로 구분한다", async () => {
    mockFetch(404, { status: 404, errorCode: "EVENT_NOT_FOUND" });

    await expect(fetchEvent("nope")).rejects.toBeInstanceOf(EventNotFoundError);
  });
});
