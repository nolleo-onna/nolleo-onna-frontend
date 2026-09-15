"use client";

import { useEffect } from "react";

const RELOAD_KEY = "chunk-reload-at";
const RELOAD_COOLDOWN_MS = 30_000;
const CHUNK_ERROR =
  /ChunkLoadError|Loading chunk [\w-]+ failed|Loading CSS chunk|Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module/i;

/**
 * 새 버전이 배포된 뒤에도 예전 탭을 계속 쓰면, 그 탭이 알고 있는 JS 조각(chunk)이 서버에서 사라져
 * 링크를 눌러도 페이지가 안 넘어가고 새로고침해야 되는 상태가 된다. 그 오류가 보이면 한 번 새로고침한다.
 * 30초 안에 또 나면 새로고침이 반복되지 않게 그냥 둔다.
 */
export default function ChunkReloadGuard() {
  useEffect(() => {
    const reloadOnce = (message: string) => {
      if (!CHUNK_ERROR.test(message)) return;
      try {
        const last = Number(sessionStorage.getItem(RELOAD_KEY) ?? 0);
        if (Date.now() - last < RELOAD_COOLDOWN_MS) return;
        sessionStorage.setItem(RELOAD_KEY, String(Date.now()));
      } catch {
        // 저장소를 못 써도 한 번은 새로고침한다
      }
      window.location.reload();
    };

    const handleError = (e: ErrorEvent) => reloadOnce(`${e.error?.name ?? ""} ${e.message}`);
    const handleRejection = (e: PromiseRejectionEvent) => {
      const reason = e.reason as { name?: string; message?: string } | undefined;
      reloadOnce(`${reason?.name ?? ""} ${reason?.message ?? String(e.reason)}`);
    };

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleRejection);
    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleRejection);
    };
  }, []);

  return null;
}
