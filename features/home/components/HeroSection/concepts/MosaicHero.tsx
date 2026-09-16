"use client";

import Image from "next/image";
import { motion } from "motion/react";

import ConceptShell from "./ConceptShell";

const T = "https://tong.visitkorea.or.kr/cms/resource/";
const PHOTOS = [
  { src: `${T}11/3413711_image2_1.jpg`, label: "송도 케이블카" },
  { src: `${T}02/3496802_image2_1.jpg`, label: "이기대" },
  { src: `${T}60/3496960_image2_1.jpg`, label: "전포카페거리" },
  { src: `${T}74/3495874_image2_1.jpg`, label: "흰여울문화마을" },
  { src: `${T}22/3495922_image2_1.jpg`, label: "송정" },
  { src: `${T}30/3476830_image2_1.jpg`, label: "국제시장" },
  { src: `${T}50/2732750_image2_1.jpg`, label: "황령산" },
  { src: `${T}02/3545402_image2_1.jpg`, label: "금빛노을브릿지" },
  { src: `${T}00/3494300_image2_1.jpg`, label: "오시리아 해안산책로" },
];
// 열마다 사진 순서·속도·방향을 달리해 한 벽처럼 흐르게
const COLUMNS = [0, 1, 2, 3, 4].map((c) => ({
  photos: [0, 1, 2, 3, 4].map((i) => PHOTOS[(i * 2 + c * 3) % PHOTOS.length]),
  up: c % 2 === 0,
  duration: 38 + c * 6,
}));

function PhotoWall() {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden bg-ocean-700" aria-hidden>
      <div className="absolute left-1/2 top-1/2 flex w-[1100px] -translate-x-1/2 -translate-y-1/2 -rotate-[10deg] gap-3 md:w-[1500px] md:gap-4">
        {COLUMNS.map((col, c) => (
          <motion.div
            key={c}
            className="flex flex-1 flex-col gap-3 md:gap-4"
            animate={{ y: col.up ? ["0%", "-50%"] : ["-50%", "0%"] }}
            transition={{ duration: col.duration, repeat: Infinity, ease: "linear" }}
          >
            {[...col.photos, ...col.photos].map((photo, i) => (
              <div key={i} className="relative aspect-[4/5] overflow-hidden rounded-[22px]">
                <Image src={photo.src} alt="" fill sizes="300px" loading="eager" className="object-cover" />
                <span className="absolute bottom-3 left-3 rounded-full bg-black/35 px-2.5 py-1 text-[12px] font-semibold text-white backdrop-blur-md">
                  {photo.label}
                </span>
              </div>
            ))}
          </motion.div>
        ))}
      </div>
      {/* 가운데 글씨가 읽히도록 가운데만 바다색으로 살짝 눌러준다 — 너무 어두우면 칙칙해서 옅게 */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(13,48,128,0.62)_0%,rgba(13,48,128,0.3)_50%,rgba(13,48,128,0.08)_100%)]" />
    </div>
  );
}

/** 시안 F — 부산 사진이 벽처럼 흐르는 배경. 글보다 "가고 싶다"는 느낌을 먼저 준다 */
export default function MosaicHero() {
  return (
    <ConceptShell
      background={<PhotoWall />}
      className="isolate"
      headline={
        <>
          부산, <span className="text-lime-300">어디까지 가봤어?</span>
        </>
      }
    >
      <p className="mx-auto max-w-[440px] px-5 text-[15px] text-white/85 break-keep md:text-[17px]">
        부산 곳곳에서 오늘 나한테 맞는 곳만 골라 코스로 이어드려요
      </p>
    </ConceptShell>
  );
}
