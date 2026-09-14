"use client";

import { createContext, useContext, useRef, useState } from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react";

import type { MotionValue } from "motion/react";

/** 누른 채 끌 때 최대 기울기(도) — 좌우는 크게, 위아래는 조금 */
const MAX_DRAG_TILT_Y = 28;
const MAX_DRAG_TILT_X = 16;
/** 누르지 않고 올려만 뒀을 때 기울기 */
const HOVER_TILT = 5;
/** 이만큼(px) 넘게 끌면 드래그로 보고, 손을 뗐을 때 링크 이동(클릭)을 막는다 */
const CLICK_SLOP = 6;
const HOVER_GLARE = 0.3;

interface GlareValues {
  x: MotionValue<number>;
  y: MotionValue<number>;
  opacity: MotionValue<number>;
}

const GlareContext = createContext<GlareValues | null>(null);

function clamp(value: number, max: number) {
  return Math.max(-max, Math.min(max, value));
}

interface HoloCardProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * 포켓몬 카드 앱처럼 "손에 든 카드" 느낌을 주는 래퍼.
 * - 마우스를 올리면 살짝 기울고, 누르면 카드가 들리며(확대·위로), 누른 채 좌우·위아래로 끌면 크게 기운다.
 * - 손을 떼면 스프링으로 흔들리며 제자리로 돌아온다. 끌었을 땐 안쪽 링크로 이동하지 않는다.
 * - 빛 반사·홀로그램 광택은 카드 그림 위에 <HoloGlare />를 두면 포인터 위치를 따라 움직인다.
 * 터치는 가로 스크롤과 겹치므로 마우스에서만 반응하고, 동작 줄이기 설정이면 기울지 않는다.
 */
export default function HoloCard({ children, className = "" }: HoloCardProps) {
  const reduceMotion = useReducedMotion();
  const rotateXTarget = useMotionValue(0);
  const rotateYTarget = useMotionValue(0);
  // 감쇠를 낮게 둬서 손을 뗄 때 한두 번 흔들리며 멈춘다
  const rotateX = useSpring(rotateXTarget, { stiffness: 170, damping: 13, mass: 0.7 });
  const rotateY = useSpring(rotateYTarget, { stiffness: 170, damping: 13, mass: 0.7 });
  const scale = useSpring(1, { stiffness: 320, damping: 22 });
  const lift = useSpring(0, { stiffness: 320, damping: 24 });
  const glareX = useMotionValue(50);
  const glareY = useMotionValue(50);
  const glareOpacity = useSpring(0, { stiffness: 220, damping: 26 });

  const press = useRef<{ x: number; y: number; moved: boolean } | null>(null);
  const suppressClick = useRef(false);
  const [lifted, setLifted] = useState(false);

  const trackGlare = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    glareX.set(Math.min(100, Math.max(0, px * 100)));
    glareY.set(Math.min(100, Math.max(0, py * 100)));
    return { rect, px, py };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (reduceMotion || e.pointerType !== "mouse" || e.button !== 0) return;
    press.current = { x: e.clientX, y: e.clientY, moved: false };
    suppressClick.current = false;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // 캡처를 못 해도 카드 위에서는 그대로 동작한다
    }
    trackGlare(e);
    scale.set(1.06);
    lift.set(-8);
    glareOpacity.set(1);
    setLifted(true);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (reduceMotion || e.pointerType !== "mouse") return;
    const { rect, px, py } = trackGlare(e);
    if (press.current) {
      const dx = e.clientX - press.current.x;
      const dy = e.clientY - press.current.y;
      if (Math.hypot(dx, dy) > CLICK_SLOP) press.current.moved = true;
      // 끈 방향 쪽 모서리가 눌려 들어가도록 — 카드 폭만큼 끌면 최대 기울기
      rotateYTarget.set(clamp((dx / rect.width) * MAX_DRAG_TILT_Y * 1.6, MAX_DRAG_TILT_Y));
      rotateXTarget.set(clamp((-dy / rect.height) * MAX_DRAG_TILT_X * 1.6, MAX_DRAG_TILT_X));
      return;
    }
    rotateYTarget.set((px - 0.5) * 2 * HOVER_TILT);
    rotateXTarget.set(-(py - 0.5) * 2 * HOVER_TILT);
    glareOpacity.set(HOVER_GLARE);
  };

  const release = (e: React.PointerEvent<HTMLDivElement>, stillHovering: boolean) => {
    if (!press.current) return;
    suppressClick.current = press.current.moved;
    press.current = null;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // 이미 풀린 경우
    }
    rotateXTarget.set(0);
    rotateYTarget.set(0);
    scale.set(1);
    lift.set(0);
    glareOpacity.set(stillHovering ? HOVER_GLARE : 0);
    setLifted(false);
  };

  const handlePointerLeave = () => {
    if (press.current) return;
    rotateXTarget.set(0);
    rotateYTarget.set(0);
    glareOpacity.set(0);
  };

  const handleClickCapture = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!suppressClick.current) return;
    // 카드를 끌다 놓은 건 클릭이 아니다 — 안쪽 링크로 넘어가지 않게 막는다
    e.preventDefault();
    e.stopPropagation();
    suppressClick.current = false;
  };

  return (
    <GlareContext.Provider value={{ x: glareX, y: glareY, opacity: glareOpacity }}>
      <motion.div
        data-lifted={lifted}
        className={`${lifted ? "cursor-grabbing" : "cursor-grab"} select-none ${className}`}
        style={{ rotateX, rotateY, scale, y: lift, transformPerspective: 900 }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={(e) => release(e, true)}
        onPointerCancel={(e) => release(e, false)}
        onPointerLeave={handlePointerLeave}
        onClickCapture={handleClickCapture}
        // 이미지·링크 기본 드래그(고스트 이미지)가 카드 끌기를 끊지 않게
        onDragStart={(e) => e.preventDefault()}
      >
        {children}
      </motion.div>
    </GlareContext.Provider>
  );
}

/**
 * 카드 그림 위에 까는 빛 반사 + 홀로그램 광택. 부모(overflow-hidden, rounded)의 모양대로 잘린다.
 * HoloCard 안에서만 의미가 있고, 밖에 두면 아무것도 그리지 않는다.
 */
export function HoloGlare() {
  const glare = useContext(GlareContext);
  const fallbackX = useMotionValue(50);
  const fallbackY = useMotionValue(50);
  const fallbackOpacity = useMotionValue(0);
  const x = glare?.x ?? fallbackX;
  const y = glare?.y ?? fallbackY;
  const opacity = glare?.opacity ?? fallbackOpacity;

  const specular = useMotionTemplate`radial-gradient(circle at ${x}% ${y}%, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.18) 28%, rgba(255,255,255,0) 58%)`;
  const holoPosition = useMotionTemplate`${x}% ${y}%`;
  const holoOpacity = useTransform(opacity, (v) => v * 0.5);

  if (!glare) return null;

  return (
    <>
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-10"
        style={{
          backgroundImage:
            "linear-gradient(115deg, transparent 22%, rgba(255,119,198,0.6) 36%, rgba(120,224,255,0.6) 50%, rgba(255,236,120,0.6) 64%, transparent 78%)",
          backgroundSize: "260% 260%",
          backgroundPosition: holoPosition,
          mixBlendMode: "color-dodge",
          opacity: holoOpacity,
        }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-10"
        style={{ background: specular, mixBlendMode: "overlay", opacity }}
      />
    </>
  );
}
