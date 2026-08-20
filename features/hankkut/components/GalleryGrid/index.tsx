"use client";

import { type Variants, motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { MessageSquareText, PenLine } from "lucide-react";

import {
  HANKKUT_GALLERIES,
  getGallerySummary,
} from "@/features/hankkut/data/galleries";

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: "easeOut" },
  },
};

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.04 },
  },
};

// 지역 갤러리 목록 — 카드마다 대표 이미지·글 수·이번 주 인기글 제목을 미리보기로 보여준다.
// 아직 글이 없는 동네는 대표 이미지가 없어 밋밋해 보이기 쉬워서, 이모지를 크게
// 띄우고 "첫 글의 주인공" 문구로 빈 자리를 채운다.
export default function GalleryGrid() {
  return (
    <motion.div
      className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {HANKKUT_GALLERIES.map((gallery) => {
        const { postCount, coverImage, topPostTitle } = getGallerySummary(gallery.slug);
        const isEmpty = postCount === 0;

        return (
          <motion.div key={gallery.slug} variants={itemVariants}>
            <Link
              href={`/hankkut/region/${gallery.slug}`}
              className="group relative block h-56 overflow-hidden rounded-2xl transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_20px_40px_-16px_rgba(10,132,255,0.25)]"
            >
              {coverImage ? (
                <Image
                  src={coverImage}
                  alt={gallery.name}
                  fill
                  sizes="(max-width: 744px) 100vw, (max-width: 1280px) 50vw, 33vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="relative flex h-full w-full items-center justify-center bg-gradient-to-br from-ocean-100 via-white to-lime-100">
                  <span
                    aria-hidden
                    className="text-7xl opacity-40 transition-transform duration-300 group-hover:scale-110"
                  >
                    {gallery.emoji}
                  </span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-black/10" />

              <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4">
                <span className="flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 text-xs font-bold text-navy-900">
                  <span aria-hidden>{gallery.emoji}</span>
                  {postCount}개의 글
                </span>
              </div>

              <div className="absolute inset-x-0 bottom-0 p-5">
                <h2 className="text-xl font-bold text-white">
                  {gallery.name} <span className="text-lime-300">한끗</span>
                </h2>
                <p className="mt-0.5 text-xs text-white/70">{gallery.tagline}</p>
                {isEmpty ? (
                  <p className="mt-2 flex items-center gap-1.5 rounded-xl bg-white/10 px-2.5 py-1.5 text-xs text-white/90 backdrop-blur-sm">
                    <PenLine className="h-3.5 w-3.5 shrink-0 text-lime-300" />
                    첫 글의 주인공이 되어보세요
                  </p>
                ) : (
                  topPostTitle && (
                    <p className="mt-2 flex items-start gap-1.5 rounded-xl bg-white/10 px-2.5 py-1.5 text-xs text-white/90 backdrop-blur-sm">
                      <MessageSquareText className="mt-0.5 h-3.5 w-3.5 shrink-0 text-lime-300" />
                      <span className="line-clamp-1">{topPostTitle}</span>
                    </p>
                  )
                )}
              </div>
            </Link>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
