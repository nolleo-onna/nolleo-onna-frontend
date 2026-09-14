import type { Metadata } from "next";

import EventDetailView from "@/features/event/components/EventDetailView";

export const metadata: Metadata = {
  title: "행사 상세 | 놀러온나",
};

interface EventDetailPageProps {
  params: Promise<{ contentId: string }>;
}

// 히어로가 화면 끝까지 차야 해서 폭 제한 없이 헤더 높이만큼만 띄운다
export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const { contentId } = await params;

  return (
    <div className="pt-16">
      <EventDetailView contentId={contentId} />
    </div>
  );
}
