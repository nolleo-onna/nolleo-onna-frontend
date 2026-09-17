import { describe, expect, it } from "vitest";

import { getEventHankkutHref } from "./eventHankkutLink";

describe("getEventHankkutHref", () => {
  it("그 행사를 직접 다룬 한끗 글이 있으면 그 글로 간다", () => {
    // 한끗 글 15번이 부산불꽃축제(235076)를 다룬다
    expect(getEventHankkutHref({ contentId: "235076", addr1: "부산광역시 수영구 광안해변로 219" })).toBe(
      "/hankkut/15",
    );
  });

  it("글이 없으면 행사가 열리는 구의 한끗 동네 페이지로 간다", () => {
    expect(getEventHankkutHref({ contentId: "9999999", addr1: "부산광역시 영도구 해양로 301" })).toBe(
      "/hankkut/region/yeongdo",
    );
  });

  it("한 구를 여러 동네가 나눠 쓰면 먼저 정의된 동네로 간다 (사하구 → 사하)", () => {
    expect(getEventHankkutHref({ contentId: "9999999", addr1: "부산광역시 사하구 낙동남로 1233" })).toBe(
      "/hankkut/region/saha",
    );
  });

  it("한끗에 그 구 동네가 없으면 행사 상세로 간다", () => {
    expect(getEventHankkutHref({ contentId: "1234567", addr1: "부산광역시 금정구 부산대학로 63" })).toBe(
      "/event/1234567",
    );
  });

  it("주소가 없어도 행사 상세로 떨어진다", () => {
    expect(getEventHankkutHref({ contentId: "1234567", addr1: null })).toBe("/event/1234567");
  });
});
