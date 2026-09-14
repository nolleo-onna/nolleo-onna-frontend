"use client";

import type { Transition, Variants } from "motion/react";

/**
 * 채팅 모달 · 코스 생성 오버레이의 "애플식" 열림/닫힘.
 *
 * iOS에서 앱 아이콘을 누르면 그 자리에서 창이 커져 나오듯, 모달이 방금 누른 버튼 위치에서 작게 시작해
 * 스프링으로 화면 가운데에 자리 잡고, 닫을 땐 같은 자리로 빨려 들어간다.
 * 어느 버튼으로 열었는지는 호출하는 쪽을 고치지 않도록 마지막 pointerdown 좌표로 알아낸다.
 * 키보드로 열었거나 클릭이 오래전이면 가운데 조금 아래에서 떠오른다.
 */

const EASE_OUT = [0.22, 1, 0.36, 1] as const;
/** 이보다 오래된 클릭은 이번 열림과 관계없다고 본다 */
const RECENT_POINTER_MS = 1500;
const FALLBACK_OFFSET = { x: 0, y: 48 };
/** 누른 자리에서 시작할 때의 크기 — 버튼만 한 크기에서 커져 나오게 */
const LAUNCH_SCALE = 0.18;

let lastPointer: { x: number; y: number; at: number } | null = null;
let launchOffset = FALLBACK_OFFSET;

if (typeof window !== "undefined") {
  window.addEventListener(
    "pointerdown",
    (e) => {
      lastPointer = { x: e.clientX, y: e.clientY, at: Date.now() };
    },
    { capture: true, passive: true },
  );
}

/** 모달 중심(=화면 중앙)에서 방금 누른 곳까지의 거리. 닫힐 때 되돌아갈 수 있게 기억해 둔다 */
function captureLaunchOffset() {
  const recent = lastPointer !== null && Date.now() - lastPointer.at < RECENT_POINTER_MS;
  launchOffset =
    recent && lastPointer
      ? { x: lastPointer.x - window.innerWidth / 2, y: lastPointer.y - window.innerHeight / 2 }
      : FALLBACK_OFFSET;
  return launchOffset;
}

/** 모달 본체 — initial="from" · animate="open" · exit="back" */
export const launchPanel: Variants = {
  from: () => {
    const { x, y } = captureLaunchOffset();
    return { opacity: 0, scale: LAUNCH_SCALE, x, y };
  },
  open: {
    opacity: 1,
    scale: 1,
    x: 0,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 30, mass: 0.9, opacity: { duration: 0.16 } },
  },
  back: () => ({
    opacity: 0,
    scale: LAUNCH_SCALE,
    x: launchOffset.x,
    y: launchOffset.y,
    transition: { type: "spring", stiffness: 420, damping: 40, mass: 0.7, opacity: { duration: 0.2, delay: 0.06 } },
  }),
};

/** 모달 안의 덩어리(헤더 · 대화 · 입력창)가 본체가 자리 잡는 동안 차례로 올라온다. custom = 순서 */
export const launchContent: Variants = {
  from: { opacity: 0, y: 12 },
  open: (order: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: EASE_OUT, delay: 0.1 + order * 0.06 },
  }),
  back: { opacity: 0, transition: { duration: 0.12 } },
};

const backdropTransition: Transition = { duration: 0.32, ease: EASE_OUT };

/** 뒤 배경 — 어두워지면서 흐려진다 */
export const backdropMotion = {
  initial: { opacity: 0, backdropFilter: "blur(0px)" },
  animate: { opacity: 1, backdropFilter: "blur(6px)" },
  exit: { opacity: 0, backdropFilter: "blur(0px)" },
  transition: backdropTransition,
};
