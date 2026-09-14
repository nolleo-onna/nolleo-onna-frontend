import { notFound } from "next/navigation";

import DetailReveal from "@/features/hankkut/components/DetailReveal";
import HankkutDetailContent from "@/features/hankkut/components/HankkutDetailContent";
import HankkutDetailHeader from "@/features/hankkut/components/HankkutDetailHeader";
import HankkutDetailSidebar from "@/features/hankkut/components/HankkutDetailSidebar";
import {
  getHankkutDetail,
  getOtherHankkutList,
} from "@/features/hankkut/data/hankkutDetail";

interface HankkutDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function HankkutDetailPage({
  params,
}: HankkutDetailPageProps) {
  const { id } = await params;
  const hankkut = getHankkutDetail(Number(id));

  if (!hankkut) notFound();

  const otherList = getOtherHankkutList(hankkut.id);

  return (
    <div className="bg-gray-50 pt-16">
      <HankkutDetailHeader hankkut={hankkut} />
      <div className="mx-auto grid max-w-[1180px] grid-cols-1 gap-8 px-5 py-10 md:px-10 lg:grid-cols-[minmax(0,1fr)_340px] lg:py-14">
        <DetailReveal delay={0.08}>
          <HankkutDetailContent hankkut={hankkut} />
        </DetailReveal>
        <DetailReveal delay={0.14}>
          <div className="lg:sticky lg:top-24">
            <HankkutDetailSidebar hankkut={hankkut} otherList={otherList} />
          </div>
        </DetailReveal>
      </div>
    </div>
  );
}
