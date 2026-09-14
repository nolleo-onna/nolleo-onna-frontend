"use client";

import { useCallback, useEffect, useRef } from "react";

interface UseLoopingCarouselOptions {
  /** 카드가 한 화면보다 많을 때만 켠다 — 목록을 두 벌 렌더링하고 자동으로 넘긴다 */
  enabled: boolean;
  intervalMs: number;
  /** 카드 사이 간격(px) — 스크롤러의 gap과 같아야 한 칸씩 정확히 넘어간다 */
  gapPx: number;
}

/**
 * 카드 가로 슬라이드. 목록을 두 벌 이어 붙여 두고, 뒷벌에 들어서면 화면상 똑같이 보이는
 * 앞벌의 같은 위치로 순간 이동해 끝에서 처음으로 되감기지 않고 이어진다(예전 SpotsPreviewSection과
 * 같은 방식). 일정 간격으로 한 칸씩 넘어가고, 마우스를 올리거나 직접 넘기는 동안은 멈춘다.
 */
export function useLoopingCarousel({ enabled, intervalMs, gapPx }: UseLoopingCarouselOptions) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollByCard = useCallback(
    (direction: 1 | -1) => {
      const el = scrollRef.current;
      if (!el) return;
      const first = el.firstElementChild;
      const step =
        first instanceof HTMLElement ? first.getBoundingClientRect().width + gapPx : el.clientWidth;

      if (!enabled) {
        el.scrollBy({ left: direction * step, behavior: "smooth" });
        return;
      }

      // 앞벌 길이 = 카드 수(두 벌이니 절반) × 한 칸
      const half = (el.children.length / 2) * step;
      let current = el.scrollLeft;
      if (direction === 1 && current >= half) {
        current -= half;
        el.scrollLeft = current;
      } else if (direction === -1 && current < step) {
        current += half;
        el.scrollLeft = current;
      }
      el.scrollTo({ left: current + direction * step, behavior: "smooth" });
    },
    [enabled, gapPx],
  );

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || !enabled) return;
    // 움직임 줄이기 설정이면 자동으로 넘기지 않는다(화살표로는 넘길 수 있다)
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let isHovering = false;
    let cooldownUntil = 0;

    const handleMouseEnter = () => {
      isHovering = true;
    };
    const handleMouseLeave = () => {
      isHovering = false;
    };
    const handleInteraction = () => {
      cooldownUntil = Date.now() + intervalMs;
    };

    const intervalId = setInterval(() => {
      if (!isHovering && Date.now() > cooldownUntil) scrollByCard(1);
    }, intervalMs);

    el.addEventListener("mouseenter", handleMouseEnter);
    el.addEventListener("mouseleave", handleMouseLeave);
    el.addEventListener("pointerdown", handleInteraction);
    el.addEventListener("wheel", handleInteraction, { passive: true });
    el.addEventListener("focusin", handleMouseEnter);
    el.addEventListener("focusout", handleMouseLeave);

    return () => {
      clearInterval(intervalId);
      el.removeEventListener("mouseenter", handleMouseEnter);
      el.removeEventListener("mouseleave", handleMouseLeave);
      el.removeEventListener("pointerdown", handleInteraction);
      el.removeEventListener("wheel", handleInteraction);
      el.removeEventListener("focusin", handleMouseEnter);
      el.removeEventListener("focusout", handleMouseLeave);
    };
  }, [enabled, intervalMs, scrollByCard]);

  return { scrollRef, scrollByCard };
}
