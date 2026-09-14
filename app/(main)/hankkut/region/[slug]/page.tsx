import type { Metadata } from "next";
import { notFound } from "next/navigation";

import RegionBoardList from "@/features/hankkut/components/RegionBoardList";
import RegionHero from "@/features/hankkut/components/RegionHero";
import RegionHotIssue from "@/features/hankkut/components/RegionHotIssue";
import { getGalleryBySlug } from "@/features/hankkut/data/galleries";

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

  return (
    <div className="pt-16">
      <RegionHero gallery={gallery} />

      <div className="mx-auto w-full max-w-[1280px] px-5 pb-16 pt-10 md:px-10 md:pt-14 lg:px-20">
        {/* 핫이슈 — 이 동네에서 지금 갈 수 있는 행사 + 인기글(+ 큐레이션). 보여줄 게 없으면 통째로 숨는다 */}
        <RegionHotIssue gallery={gallery} />

        {/* 화제글 — 백엔드 게시글 API를 갤러리의 행정구(districtTag)로 걸러 보여준다 */}
        <div id="board" className="mt-12 scroll-mt-24 md:mt-16">
          <RegionBoardList regionSlug={slug} regionName={gallery.name} districtTag={gallery.districtTag} />
        </div>
      </div>
    </div>
  );
}
