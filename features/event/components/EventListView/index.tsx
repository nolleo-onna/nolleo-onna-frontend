"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

import EventCard from "@/features/event/components/EventCard";
import { useEvents } from "@/features/event/hooks/useEvents";
import { groupEventsByStatus, toDateKey } from "@/features/event/utils/eventSchedule";

import type { BusanEvent } from "@/types/event";

function EventGrid({ events, today }: { events: BusanEvent[]; today: string }) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-7 md:grid-cols-3 lg:grid-cols-4">
      {events.map((event) => (
        <EventCard key={event.contentId} event={event} today={today} />
      ))}
    </div>
  );
}

function GroupHeading({ title, count }: { title: string; count: number }) {
  return (
    <h2 className="mb-4 flex items-baseline gap-2 text-lg font-bold text-navy-900">
      {title}
      <span className="text-sm font-semibold tabular-nums text-gray-400">{count}</span>
    </h2>
  );
}

/** 부산 행사 전체 — 진행 중 · 다가오는 행사 · 지난 행사(접힘) */
export default function EventListView() {
  const { data, isPending, isError } = useEvents();
  const [showEnded, setShowEnded] = useState(false);
  const today = toDateKey(new Date());
  const { ongoing, upcoming, ended } = groupEventsByStatus(data ?? [], today);

  return (
    <>
      <header className="mb-10">
        <p className="text-xs font-semibold uppercase tracking-widest text-pink-500">Busan Events</p>
        <h1 className="mt-1 text-2xl font-bold text-navy-900 md:text-3xl">부산 축제·공연</h1>
        <p className="mt-2 text-sm text-gray-500">
          한국관광공사에 등록된 부산 행사예요. 일정은 주최 측 사정으로 바뀔 수 있으니 방문 전 확인하세요.
        </p>
      </header>

      {isPending ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className="animate-shimmer aspect-[4/3] rounded-2xl" />
          ))}
        </div>
      ) : isError ? (
        <p className="rounded-2xl bg-gray-50 px-6 py-16 text-center text-sm text-gray-500">
          행사 정보를 불러오지 못했어요. 잠시 후 다시 시도해주세요.
        </p>
      ) : (
        <div className="flex flex-col gap-12">
          {ongoing.length > 0 && (
            <section>
              <GroupHeading title="지금 진행 중" count={ongoing.length} />
              <EventGrid events={ongoing} today={today} />
            </section>
          )}

          <section>
            <GroupHeading title="다가오는 행사" count={upcoming.length} />
            {upcoming.length > 0 ? (
              <EventGrid events={upcoming} today={today} />
            ) : (
              <p className="rounded-2xl bg-gray-50 px-6 py-10 text-center text-sm text-gray-400">
                아직 등록된 예정 행사가 없어요
              </p>
            )}
          </section>

          {ended.length > 0 && (
            <section>
              <button
                type="button"
                onClick={() => setShowEnded((v) => !v)}
                aria-expanded={showEnded}
                className="flex items-center gap-1 text-sm font-semibold text-gray-500 transition-colors hover:text-gray-700"
              >
                지난 행사 {ended.length}개
                <ChevronDown className={`h-4 w-4 transition-transform ${showEnded ? "rotate-180" : ""}`} />
              </button>
              {showEnded && (
                <div className="mt-5">
                  <EventGrid events={ended} today={today} />
                </div>
              )}
            </section>
          )}
        </div>
      )}
    </>
  );
}
