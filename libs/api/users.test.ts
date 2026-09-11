import { afterEach, describe, expect, it, vi } from "vitest";

import { fetchFavoriteStats } from "./users";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("fetchFavoriteStats", () => {
  it("찜 통계 data를 그대로 돌려준다", async () => {
    const stats = { period: "WEEK", count: 3, message: "이번 주 3개 찜했어요!" };
    const fetchMock = vi.fn().mockResolvedValue({ status: 200, ok: true, json: async () => ({ status: 200, message: "ok", data: stats }) });
    vi.stubGlobal("fetch", fetchMock);
    vi.stubGlobal("window", { location: { pathname: "/mypage", search: "", href: "" } });

    await expect(fetchFavoriteStats()).resolves.toEqual(stats);
    expect(fetchMock.mock.calls[0][0]).toBe("https://api.test.local/api/v1/users/me/favorite-stats");
  });
});
