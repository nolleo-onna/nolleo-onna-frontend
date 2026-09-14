import { describe, expect, it } from "vitest";

import { BUDGET_OPTIONS, MOOD_OPTIONS, WHO_OPTIONS, buildPlayPrompt } from "./playSentence";

describe("buildPlayPrompt", () => {
  it("누구랑 · 어떤 하루 · 예산을 한 문장 프롬프트로 잇는다", () => {
    const couple = WHO_OPTIONS.find((o) => o.id === "couple")!;
    const night = MOOD_OPTIONS.find((o) => o.id === "night")!;
    const budget = BUDGET_OPTIONS.find((o) => o.id === "50k")!;
    expect(buildPlayPrompt(couple, night, budget)).toBe(
      "연인이랑 황령산·해운대처럼 야경 예쁜 곳 도는 부산 코스 짜줘. 예산은 1인 5만원 안쪽이야.",
    );
  });

  it("선택지 id는 자리마다 겹치지 않고, 하루 선택지는 모두 사진이 있다", () => {
    for (const options of [WHO_OPTIONS, MOOD_OPTIONS, BUDGET_OPTIONS]) {
      expect(new Set(options.map((o) => o.id)).size).toBe(options.length);
    }
    expect(MOOD_OPTIONS.every((o) => o.imageUrl.length > 0)).toBe(true);
  });
});
