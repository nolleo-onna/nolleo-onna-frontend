import { describe, expect, it } from "vitest";

import { isEdited } from "./isEdited";

describe("isEdited", () => {
  it("updatedAt이 없거나 생성과 거의 같은 시각이면 수정 아님", () => {
    expect(isEdited("2026-09-14T10:00:00.000Z", null)).toBe(false);
    expect(isEdited("2026-09-14T10:00:00.000Z", "2026-09-14T10:00:00.412Z")).toBe(false);
  });

  it("1초 넘게 뒤에 바뀌었으면 수정", () => {
    expect(isEdited("2026-09-14T10:00:00.000Z", "2026-09-14T10:05:00.000Z")).toBe(true);
  });
});
