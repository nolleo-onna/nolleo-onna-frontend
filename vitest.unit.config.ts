import path from "node:path";
import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

const dirname =
  typeof __dirname !== "undefined" ? __dirname : path.dirname(fileURLToPath(import.meta.url));

// 훅/유틸 단위 테스트 전용 설정. vitest.config.ts(스토리북 애드온)와는 완전히
// 분리해뒀다 — 둘을 한 config에 묶으면 스토리북 애드온의 버전 문제가 이 테스트까지
// 끌고 내려간다.
export default defineConfig({
  resolve: {
    alias: {
      "@": dirname,
    },
  },
  test: {
    name: "unit",
    environment: "node",
    include: ["**/*.test.ts"],
    exclude: ["node_modules/**", ".claude/worktrees/**", ".storybook/**"],
    env: {
      // libs/clientFetch.ts는 모듈 로드 시점에 이 값을 검사한다.
      NEXT_PUBLIC_API_BASE_URL: "https://api.test.local",
    },
  },
});
