"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "hankkut:bookmarks";

function readBookmarks(): number[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as number[]) : [];
  } catch {
    return [];
  }
}

// 찜한 한끗을 백엔드 없이 로컬(localStorage)에만 저장한다. 백엔드에
// 찜하기 API가 아직 없어 서버와 동기화되진 않지만, 이 기기에서는
// 새로고침해도 유지된다.
export function useHankkutBookmark(id: number) {
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    /* eslint-disable-next-line react-hooks/set-state-in-effect -- 마운트 후에만 localStorage를 읽어야 하이드레이션 불일치가 안 생김 */
    setIsBookmarked(readBookmarks().includes(id));
  }, [id]);

  const toggle = useCallback(() => {
    const current = readBookmarks();
    const next = current.includes(id)
      ? current.filter((existingId) => existingId !== id)
      : [...current, id];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setIsBookmarked(next.includes(id));
  }, [id]);

  return { isBookmarked, toggle };
}
