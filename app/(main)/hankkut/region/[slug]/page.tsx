import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, PenLine } from "lucide-react";

import RegionBoardList from "@/features/hankkut/components/RegionBoardList";
import RegionWeeklyBest from "@/features/hankkut/components/RegionWeeklyBest";
import {
  getGalleryBySlug,
  getPostsForGallery,
} from "@/features/hankkut/data/galleries";

interface RegionPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: RegionPageProps): Promise<Metadata> {
  const { slug } = await params;
  const gallery = getGalleryBySlug(slug);
  return { title: gallery ? `${gallery.name} 한끗 | 놀러온나` : "한끗 | 놀러온나" };
}

export default async function HankkutRegionPage({ params }: RegionPageProps) {
  const { slug } = await params;
  const gallery = getGalleryBySlug(slug);

  if (!gallery) {
    notFound();
  }

  const curatedPosts = getPostsForGallery(slug);

  return (
    <div className="pt-16">
      <div className="mx-auto w-full max-w-[1280px] px-5 py-8 md:px-10 lg:px-20">
        <Link
          href="/hankkut"
          className="inline-flex items-center gap-1 text-sm font-medium text-gray-500 transition-colors hover:text-navy-900"
        >
          <ChevronLeft className="h-4 w-4" />
          전체 동네 보기
        </Link>

        <section className="relative mt-4 overflow-hidden rounded-3xl bg-gradient-to-br from-ocean-50 via-white to-lime-50 px-6 py-10 md:px-12 md:py-12">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="flex items-center gap-1.5 text-sm font-semibold text-ocean-600">
                <span aria-hidden>{gallery.emoji}</span>
                {gallery.tagline}
              </p>
              <h1 className="mt-2 text-4xl font-bold text-navy-900 md:text-5xl">
                {gallery.name}{" "}
                <span className="relative inline-block">
                  <span
                    aria-hidden
                    className="absolute inset-x-0 bottom-1 -z-10 h-3 rounded-sm bg-lime-300 md:h-4"
                  />
                  한끗
                </span>
              </h1>
            </div>

            <Link
              href={`/hankkut/region/${slug}/write`}
              className="inline-flex w-fit items-center gap-1.5 rounded-full bg-navy-900 px-5 py-3 text-sm font-semibold text-lime-300 transition-transform hover:-translate-y-0.5"
            >
              <PenLine className="h-4 w-4" />
              글쓰기
            </Link>
          </div>
        </section>

        <div className="mt-10">
          <RegionWeeklyBest gallery={gallery} curatedPosts={curatedPosts} />
        </div>

        {/* 자유게시판 — 글은 localStorage 기반 프론트 MVP (useHankkutPosts) */}
        <div className="mt-10">
          <RegionBoardList regionSlug={slug} />
        </div>
        <div className="mt-14" />
      </div>
    </div>
  );
}
