import type { Metadata } from "next";
import { notFound } from "next/navigation";

import PostWriteForm from "@/features/hankkut/components/PostWriteForm";
import { getGalleryBySlug } from "@/features/hankkut/data/galleries";

export const metadata: Metadata = {
  title: "글쓰기 | 놀러온나",
};

interface WritePageProps {
  params: Promise<{ slug: string }>;
}

export default async function HankkutWritePage({ params }: WritePageProps) {
  const { slug } = await params;
  const gallery = getGalleryBySlug(slug);
  if (!gallery) notFound();

  return (
    <div className="pt-16">
      <main className="mx-auto w-full max-w-3xl px-5 py-10 md:px-10">
        <header className="mb-6">
          <p className="text-xs font-semibold tracking-widest text-ocean-600 uppercase">
            Community
          </p>
          <h1 className="mt-1 text-2xl font-bold text-navy-900">
            {gallery.emoji} {gallery.name} 한끗에 글쓰기
          </h1>
          <p className="mt-1 text-sm text-gray-500">{gallery.tagline}</p>
        </header>
        <PostWriteForm regionSlug={slug} />
      </main>
    </div>
  );
}
