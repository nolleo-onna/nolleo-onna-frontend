import type { Metadata } from "next";

import EventListView from "@/features/event/components/EventListView";

export const metadata: Metadata = {
  title: "부산 축제·공연 | 놀러온나",
};

export default function EventPage() {
  return (
    <div className="pt-16">
      <main className="mx-auto w-full max-w-[1280px] px-5 py-10 md:px-10 lg:px-20">
        <EventListView />
      </main>
    </div>
  );
}
