import type { Metadata } from "next";

import EventDetailView from "@/features/event/components/EventDetailView";

export const metadata: Metadata = {
  title: "행사 상세 | 놀러온나",
};

interface EventDetailPageProps {
  params: Promise<{ contentId: string }>;
}

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const { contentId } = await params;

  return (
    <div className="pt-16">
      <main className="mx-auto w-full max-w-3xl px-5 py-10 md:px-10">
        <EventDetailView contentId={contentId} />
      </main>
    </div>
  );
}
