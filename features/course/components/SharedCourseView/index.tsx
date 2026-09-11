"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Eye, Heart, Loader2, Sparkles } from "lucide-react";

import CourseSidebar from "@/features/course/components/CourseSidebar";
import CoursePlaceDetail from "@/features/course/components/CoursePlaceDetail";
import SpotDetailModal from "@/features/spot/components/SpotDetailModal";
import AuthorAvatar from "@/features/hankkut/components/AuthorAvatar";
import MapSkeleton from "@/components/ui/Skeleton/MapSkeleton";
import { useSharedCourse } from "@/features/course/hooks/useSharedCourse";
import { useCongestion } from "@/features/home/hooks/useCongestion";
import { buildCourseCongestion } from "@/features/course/utils/courseCongestion";
import { isFoodCategory } from "@/features/course/hooks/useSpotDescription";
import { maskName } from "@/features/hankkut/utils/maskName";

import type { CourseItemResponse, SharedCourse } from "@/types/course";
import type { CoursePlace, Course } from "@/features/course/data/mockCourse";

const CourseMap = dynamic(() => import("@/features/course/components/CourseMap"), {
  ssr: false,
  loading: () => <MapSkeleton />,
});

function toPlace(item: CourseItemResponse): CoursePlace {
  return {
    id: item.serialNum,
    name: item.title,
    category: item.category,
    lat: item.mapY,
    lng: item.mapX,
    imageUrl: item.firstImage ?? "",
    description: "",
    rating: 0,
    reviewCount: 0,
    originalId: item.originalId,
    mapPlaceId: item.serialNum,
    expectedCost: item.expectedCost ?? 0,
    distanceFromPrevM: item.distanceFromPrevM,
  };
}

function toCourse(shared: SharedCourse): Course {
  const description = shared.description ?? "";
  return {
    id: 0,
    title: shared.title,
    description,
    days: [{ day: 1, title: description, places: shared.items.map(toPlace) }],
  };
}

function NotFound() {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <span className="text-3xl">🗺️</span>
      <p className="text-[15px] font-semibold text-gray-700">이 코스는 볼 수 없어요</p>
      <p className="text-xs text-gray-400">비공개로 바뀌었거나 링크가 잘못됐을 수 있어요</p>
      <Link
        href="/course"
        className="mt-1 rounded-full bg-navy-900 px-5 py-2.5 text-xs font-semibold text-lime-300 transition-transform active:scale-95"
      >
        나만의 코스 만들러 가기
      </Link>
    </div>
  );
}

/**
 * 공유 링크로 열리는 공개 코스. 결과 페이지(CourseResultView)의 읽기 전용 버전으로
 * 편집·공유 컨트롤 없이 지도·타임라인·장소 상세만 보여주고, 작성자·조회수를 상단에 단다.
 */
export default function SharedCourseView({ shareToken }: { shareToken: string }) {
  const { data, isPending, isError } = useSharedCourse(shareToken);
  const { data: congestion } = useCongestion();

  const [selectedPlaceId, setSelectedPlaceId] = useState<number | null>(null);
  const [modalContentId, setModalContentId] = useState<string | null>(null);
  const [modalPlaceType, setModalPlaceType] = useState<"SPOT" | "FOOD" | null>(null);
  const [modalMapPlaceId, setModalMapPlaceId] = useState<number | null>(null);

  if (isError) return <NotFound />;
  if (isPending || !data) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-ocean-500" />
        <p className="text-sm text-gray-500">코스를 불러오고 있어요...</p>
      </div>
    );
  }

  const course = toCourse(data);
  const places = course.days[0].places;
  const congestionByPlaceId = buildCourseCongestion(places, congestion);
  const resolvedPlaceId = selectedPlaceId ?? places[0]?.id ?? null;
  const selectedPlace = places.find((p) => p.id === resolvedPlaceId) ?? places[0];
  const authorName = data.authorNickname ? maskName(data.authorNickname) : "놀러온나 여행자";

  const handleSelectPlace = (place: CoursePlace) => setSelectedPlaceId(place.id);

  const handlePlaceClick = () => {
    if (!selectedPlace) return;
    setModalContentId(selectedPlace.originalId ?? null);
    setModalPlaceType(isFoodCategory(selectedPlace.category) ? "FOOD" : "SPOT");
    setModalMapPlaceId(selectedPlace.mapPlaceId ?? null);
  };

  const handleModalClose = () => {
    setModalContentId(null);
    setModalPlaceType(null);
    setModalMapPlaceId(null);
  };

  return (
    <>
      <div className="flex h-screen flex-col pt-16">
        {/* 작성자 · 조회수 띠 — 공유받은 사람이 누구 코스인지 바로 알 수 있게 */}
        <div className="flex items-center gap-3 border-b border-gray-100 bg-lime-50/60 px-4 py-2 text-[12px] lg:px-5">
          <AuthorAvatar name={authorName} imageUrl={data.authorProfileImageUrl ?? undefined} size={24} />
          <span className="font-semibold text-gray-700">{authorName}</span>
          <span className="text-gray-400">님이 공유한 코스</span>
          <span className="ml-auto flex items-center gap-1 text-gray-500">
            <Eye className="h-3.5 w-3.5" />
            {data.viewCount}
          </span>
          <span className="flex items-center gap-1 text-gray-500">
            <Heart className="h-3.5 w-3.5" />
            {data.likeCount}
          </span>
          <Link
            href="/course"
            className="hidden items-center gap-1 rounded-full bg-navy-900 px-3 py-1 text-[11px] font-semibold text-lime-300 sm:flex"
          >
            <Sparkles className="h-3 w-3" />
            나도 코스 만들기
          </Link>
        </div>

        <div className="flex flex-1 flex-col overflow-hidden lg:flex-row">
          <CourseSidebar
            course={course}
            selectedDay={1}
            selectedPlaceId={resolvedPlaceId}
            congestionByPlaceId={congestionByPlaceId}
            onSelectDay={() => {}}
            onSelectPlace={handleSelectPlace}
          />
          <main className="relative order-first h-[42vh] w-full shrink-0 lg:order-none lg:h-auto lg:w-auto lg:flex-1">
            <CourseMap
              places={places}
              selectedPlaceId={resolvedPlaceId}
              onSelectPlace={handleSelectPlace}
            />
            {selectedPlace && (
              <CoursePlaceDetail
                course={course}
                selectedDay={1}
                place={selectedPlace}
                congestion={congestionByPlaceId.get(selectedPlace.id)}
                onSelectDay={() => {}}
                onPlaceClick={handlePlaceClick}
              />
            )}
          </main>
        </div>
      </div>

      <SpotDetailModal
        contentId={modalContentId}
        placeType={modalPlaceType}
        mapPlaceId={modalMapPlaceId}
        onClose={handleModalClose}
      />
    </>
  );
}
