import { describe, expect, it } from "vitest";

import { REGIONS, regionChipLabel } from "./RegionFilter";

describe("regionChipLabel", () => {
  it("네 글자는 구·군을 떼어 세 글자로 — 칩 한 줄에 들어간다", () => {
    expect(regionChipLabel("해운대구")).toBe("해운대");
    expect(regionChipLabel("부산진구")).toBe("부산진");
  });

  it("세 글자 이하는 그대로 둔다 — 떼면 뜻이 흐려진다", () => {
    expect(regionChipLabel("중구")).toBe("중구");
    expect(regionChipLabel("남구")).toBe("남구");
    expect(regionChipLabel("수영구")).toBe("수영구");
    expect(regionChipLabel("기장군")).toBe("기장군");
  });

  it("모든 지역이 세 글자 이하로 보인다", () => {
    const tooLong = REGIONS.filter((region) => regionChipLabel(region).length > 3);
    expect(tooLong).toEqual([]);
  });
});
