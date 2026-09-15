"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

export interface BackdropPhoto {
  src: string;
  /** src를 못 불러오면(404 등) 대신 쓸 주소 — 관광공사 큰 원본이 없을 때 원래 사진 */
  fallbackSrc?: string;
  /** 사진 오른쪽 아래에 붙는 짧은 이름표 (예: "바다 · 송정") */
  label?: string;
}

interface PhotoBackdropProps {
  photos: BackdropPhoto[];
  /** 여러 장이면 이 간격(ms)으로 천천히 겹쳐 넘어간다 */
  interval?: number;
  /** 첫 장을 우선 로드 — 페이지 첫 화면 배너면 true */
  priority?: boolean;
  showLabel?: boolean;
  className?: string;
}

/**
 * 배너 뒤에 까는 실제 사진 배경. 사진이 천천히 줌아웃되며(켄 번스) 여러 장이면 부드럽게 겹쳐 바뀐다.
 * 부모는 relative·overflow-hidden이어야 하고, 글자 가독성용 그라데이션은 부모가 위에 얹는다.
 * 움직임 줄이기 설정이면 첫 장만 멈춘 채로 보여준다.
 */
export default function PhotoBackdrop({
  photos,
  interval = 6500,
  priority = false,
  showLabel = false,
  className = "",
}: PhotoBackdropProps) {
  const reduceMotion = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [failed, setFailed] = useState<ReadonlySet<string>>(() => new Set());
  const count = photos.length;

  useEffect(() => {
    if (count <= 1 || reduceMotion) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % count), interval);
    return () => clearInterval(timer);
  }, [count, interval, reduceMotion]);

  const photo = count > 0 ? photos[index % count] : null;
  if (!photo) return null;

  return (
    <div aria-hidden className={`pointer-events-none absolute inset-0 overflow-hidden bg-navy-800 ${className}`}>
      <AnimatePresence initial={false}>
        <motion.div
          key={photo.src}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.4, ease: "easeInOut" }}
        >
          <motion.div
            className="absolute inset-0"
            initial={{ scale: reduceMotion ? 1.04 : 1.14 }}
            animate={{ scale: reduceMotion ? 1.04 : 1.02 }}
            transition={{ duration: interval / 1000 + 2, ease: "linear" }}
          >
            <Image
              src={failed.has(photo.src) && photo.fallbackSrc ? photo.fallbackSrc : photo.src}
              onError={() => {
                if (photo.fallbackSrc && !failed.has(photo.src)) setFailed((prev) => new Set(prev).add(photo.src));
              }}
              alt=""
              fill
              sizes="100vw"
              priority={priority && index === 0}
              className="object-cover"
            />
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {showLabel && photo.label && (
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={photo.label}
            className="absolute bottom-3 right-4 rounded-full bg-black/35 px-2.5 py-1 text-[11px] font-semibold text-white/90 ring-1 ring-inset ring-white/15 backdrop-blur-md"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.4 }}
          >
            {photo.label}
          </motion.span>
        </AnimatePresence>
      )}
    </div>
  );
}
