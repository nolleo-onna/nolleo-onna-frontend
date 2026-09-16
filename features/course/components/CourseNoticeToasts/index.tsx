"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Info, TriangleAlert, X } from "lucide-react";

import { takeCourseNotices, type CourseNotice } from "@/features/course/utils/courseNotices";

/** 저절로 사라지는 시간 — 여러 개면 순서대로 조금씩 늦게 */
const DISMISS_MS = 7000;
const STAGGER_MS = 700;

/**
 * 폼으로 코스를 만들 때 요청과 다르게 적용된 조건을 결과 화면 위에 알린다.
 * (축제 위치로 바뀐 지역, 못 찾은 장소·축제, 예산 상한을 푼 경우)
 * 한 번 보여준 안내는 지워져서 같은 코스를 다시 열어도 또 뜨지 않는다.
 */
export default function CourseNoticeToasts({ pairId }: { pairId: string | null }) {
  const [notices, setNotices] = useState<CourseNotice[]>([]);

  // sessionStorage는 마운트 후에만 읽는다 (SSR에 없음)
  useEffect(() => {
    if (!pairId) return;
    /* eslint-disable-next-line react-hooks/set-state-in-effect -- sessionStorage는 마운트 후에만 읽어야 하이드레이션 불일치가 안 생김 */
    setNotices(takeCourseNotices(pairId));
  }, [pairId]);

  const dismiss = (id: string) => setNotices((prev) => prev.filter((n) => n.id !== id));

  useEffect(() => {
    if (notices.length === 0) return;
    const timers = notices.map((notice, i) =>
      setTimeout(() => dismiss(notice.id), DISMISS_MS + i * STAGGER_MS),
    );
    return () => timers.forEach(clearTimeout);
    // notices 배열 자체가 바뀔 때만 다시 건다 — dismiss로 줄어들면 남은 것만 다시 예약된다
  }, [notices]);

  if (notices.length === 0) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 top-20 z-40 flex flex-col items-center gap-2 px-4"
    >
      <AnimatePresence initial={false}>
        {notices.map((notice) => {
          const isWarn = notice.tone === "warn";
          const Icon = isWarn ? TriangleAlert : Info;
          return (
            <motion.div
              key={notice.id}
              layout
              initial={{ opacity: 0, y: -12, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
              className={`pointer-events-auto flex w-full max-w-md items-start gap-2.5 rounded-2xl px-4 py-3
                          shadow-[0_12px_32px_-12px_rgba(5,12,26,0.35)] ring-1 ring-inset backdrop-blur-md ${
                            isWarn
                              ? "bg-amber-50/95 text-amber-900 ring-amber-200"
                              : "bg-ocean-50/95 text-ocean-900 ring-ocean-200"
                          }`}
            >
              <Icon className={`mt-0.5 h-4 w-4 flex-shrink-0 ${isWarn ? "text-amber-500" : "text-ocean-500"}`} />
              <p className="min-w-0 flex-1 text-[13px] font-medium leading-relaxed break-keep">
                {notice.message}
              </p>
              <button
                type="button"
                onClick={() => dismiss(notice.id)}
                aria-label="안내 닫기"
                className="-mr-1 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full
                           text-current/50 transition-colors hover:bg-black/5"
              >
                <X className="h-3.5 w-3.5" strokeWidth={2.5} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
