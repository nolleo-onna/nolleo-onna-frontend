import { describe, expect, it } from "vitest";

import { parseSearch, toServerFilter } from "./spotSearch";

describe("toServerFilter", () => {
  it("카테고리 키워드는 서버 category 코드로 보낸다", () => {
    expect(toServerFilter(parseSearch("카페"))).toEqual({ category: "FD" });
    expect(toServerFilter(parseSearch("맛집"))).toEqual({ category: "FD" });
    expect(toServerFilter(parseSearch("박물관"))).toEqual({ category: "VE" });
  });

  it("동네·구는 district로, 함께 쓴 카테고리는 category로 보낸다", () => {
    expect(toServerFilter(parseSearch("해운대 카페"))).toEqual({ district: "해운대구", category: "FD" });
    expect(toServerFilter(parseSearch("광안리"))).toEqual({ district: "수영구" });
  });

  it("이름 검색어는 keyword로, 초성만 친 단어는 서버에 보내지 않는다", () => {
    expect(toServerFilter(parseSearch("스타벅스"))).toEqual({ keyword: "스타벅스" });
    expect(toServerFilter(parseSearch("ㅎㅇㄷ"))).toEqual({});
  });

  it("무료 키워드와 빈 검색은 서버 필터가 없다", () => {
    expect(toServerFilter(parseSearch("무료"))).toEqual({});
    expect(toServerFilter(parseSearch(""))).toEqual({});
  });
});
