"use client";

import { useMemo } from "react";
import { type Variants, motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { MessageSquareText, PenLine } from "lucide-react";

import {
  HANKKUT_GALLERIES,
  getCuratedTotalViews,
  getGallerySummary,
} from "@/features/hankkut/data/galleries";
import { selectRegionPosts, useHankkutPosts } from "@/features/hankkut/hooks/useHankkutPosts";

import type { HankkutGallery } from "@/features/hankkut/data/galleries";
import type { HankkutPost } from "@/features/hankkut/hooks/useHankkutPosts";

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

/** 큐레이션+자유게시판 조회수를 합쳐 가장 인기 있는 동네를 고른다 */
function pickFeaturedSlug(communityPosts: HankkutPost[]): string | null {
  const totals = HANKKUT_GALLERIES.map((gallery) => {
    const boardViews = selectRegionPosts(communityPosts, gallery.slug).reduce(
      (sum, post) => sum + post.views,
      0
    );
    return { slug: gallery.slug, views: getCuratedTotalViews(gallery.slug) + boardViews };
  });
  const top = totals.reduce<{ slug: string; views: number } | null>(
    (best, current) => (!best || current.views > best.views ? current : best),
    null
  );
  return top?.slug ?? null;
}

interface GalleryCardProps {
  gallery: HankkutGallery;
  postCount: number;
  coverImage?: string;
  previewTitle?: string;
  featured: boolean;
}

function GalleryCard({ gallery, postCount, coverImage, previewTitle, featured }: GalleryCardProps) {
  return (
    <Link
      href={`/hankkut/region/${gallery.slug}`}
      className={`group relative block overflow-hidden rounded-2xl transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_20px_40px_-16px_rgba(10,132,255,0.25)] ${
        featured ? "h-full min-h-[18rem]" : "h-56"
      }`}
    >
      {coverImage ? (
        <Image
          src={coverImage}
          alt={gallery.name}
          fill
          sizes="(max-width: 744px) 100vw, (max-width: 1280px) 66vw, 50vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
      ) : (
        <div className="relative flex h-full w-full items-center justify-center bg-gradient-to-br from-ocean-100 via-white to-lime-100">
          <span
            aria-hidden
            className={`opacity-40 transition-transform duration-300 group-hover:scale-110 ${
              featured ? "text-8xl" : "text-7xl"
            }`}
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
        {featured && (
          <span className="rounded-full bg-navy-900 px-2.5 py-1 text-xs font-bold text-lime-300">
            지금 가장 인기
          </span>
        )}
      </div>

      <div className={`absolute inset-x-0 bottom-0 ${featured ? "p-6" : "p-5"}`}>
        <h2 className={`font-bold text-white ${featured ? "text-2xl md:text-3xl" : "text-xl"}`}>
          {gallery.name} <span className="text-lime-300">한끗</span>
        </h2>
        <p className={`mt-0.5 text-white/70 ${featured ? "text-sm" : "text-xs"}`}>
          {gallery.tagline}
        </p>
        {previewTitle ? (
          <p
            className={`mt-2 flex items-start gap-1.5 rounded-xl bg-white/10 px-2.5 py-1.5 text-white/90 backdrop-blur-sm ${
              featured ? "text-sm" : "text-xs"
            }`}
          >
            <MessageSquareText className="mt-0.5 h-3.5 w-3.5 shrink-0 text-lime-300" />
            <span className="line-clamp-1">{previewTitle}</span>
          </p>
        ) : (
          <p className="mt-2 flex items-center gap-1.5 rounded-xl bg-white/10 px-2.5 py-1.5 text-xs text-white/90 backdrop-blur-sm">
            <PenLine className="h-3.5 w-3.5 shrink-0 text-lime-300" />
            첫 글의 주인공이 되어보세요
          </p>
        )}
      </div>
    </Link>
  );
}

// 지역 갤러리 목록 — 예전 한끗 홈 피드처럼, 큐레이션+자유게시판 조회수를 합쳐
// 가장 인기 있는 동네 하나를 크게 보여준다. 나머지는 카드마다 대표 이미지·
// 글 수·이번 주 인기글 제목을 미리보기로 보여준다. 아직 글이 없는 동네는
// 이모지를 크게 띄우고 "첫 글의 주인공" 문구로 빈 자리를 채운다.
export default function GalleryGrid() {
  const { posts: communityPosts } = useHankkutPosts();

  // 인기 동네를 배열 맨 앞으로 재배치한다. CSS만으로 순서를 바꾸면(col-start
  // 등) 아이템 수·그리드 트랙이 바뀌는 타이밍에 배치가 깨지는 걸 겪어서,
  // 배열 자체를 재배치하는 더 단순하고 안전한 방식을 쓴다.
  const orderedGalleries = useMemo(() => {
    const featuredSlug = pickFeaturedSlug(communityPosts);
    if (!featuredSlug) return HANKKUT_GALLERIES;
    const featured = HANKKUT_GALLERIES.find((g) => g.slug === featuredSlug);
    if (!featured) return HANKKUT_GALLERIES;
    return [featured, ...HANKKUT_GALLERIES.filter((g) => g.slug !== featuredSlug)];
  }, [communityPosts]);

  return (
    <motion.div
      className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {orderedGalleries.map((gallery, index) => {
        const { postCount: curatedCount, coverImage, topPostTitle } = getGallerySummary(
          gallery.slug
        );
        const boardPosts = selectRegionPosts(communityPosts, gallery.slug);
        const postCount = curatedCount + boardPosts.length;
        // 큐레이션 인기글이 없으면 자유게시판 최신 글이라도 미리보기로 보여준다
        const previewTitle = topPostTitle ?? boardPosts[0]?.title;
        const featured = index === 0;

        return (
          <motion.div
            key={gallery.slug}
            variants={itemVariants}
            className={featured ? "sm:col-span-2 lg:col-span-2 lg:row-span-2" : undefined}
          >
            <GalleryCard
              gallery={gallery}
              postCount={postCount}
              coverImage={coverImage}
              previewTitle={previewTitle}
              featured={featured}
            />
          </motion.div>
        );
      })}
    </motion.div>
  );
}
