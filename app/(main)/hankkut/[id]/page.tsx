import { notFound } from "next/navigation";

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
    <div className="pt-16">
      <div className="mx-auto w-full max-w-[1280px] px-5 py-8 md:px-10 lg:px-20">
        <HankkutDetailHeader hankkut={hankkut} />
        <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_360px]">
          <HankkutDetailContent hankkut={hankkut} />
          <HankkutDetailSidebar hankkut={hankkut} otherList={otherList} />
        </div>
      </div>
    </div>
  );
}
