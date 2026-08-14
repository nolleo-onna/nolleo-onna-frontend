"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { useCongestion } from "@/features/home/hooks/useCongestion";
import { CROWD_STYLE } from "@/features/crowd/utils/crowdUtils";
import {
  getTopCongested,
  getLeastCongested,
  type CongestionSpot,
} from "@/features/home/utils/congestion";
import type { CrowdLevel } from "@/types/crowd";

type CrowdType = "crowd" | "relaxed";

type Spot = {
  id: number;
  name: string;
  location: string;
  crowdStatus: CrowdLevel;
  /** 실데이터일 때만 채워짐 — 있으면 카드에 집중률(%) 배지를 보여준다 */
  rate?: number;
  imageUrl?: string;
};

// 백엔드 혼잡도 API가 관광지별(attractions) 데이터를 아직 안 채워줄 때 쓰는
// 대체 데이터 — rate/imageUrl을 함께 채워서 실데이터와 동일한 카드 UI로 보이게 한다.
const mockCrowdSpots: Spot[] = [
  { id: 1, name: "광안리 해수욕장", location: "해운대구 · 14-17시 피크", crowdStatus: "매우혼잡", rate: 92, imageUrl: "http://tong.visitkorea.or.kr/cms/resource/45/3311245_image2_1.jpg" },
  { id: 2, name: "해운대 해수욕장", location: "해운대구 · 13-18시 피크", crowdStatus: "매우혼잡", rate: 87, imageUrl: "https://tong.visitkorea.or.kr/cms/resource/34/3090534_image2_1.JPG" },
  { id: 3, name: "전포 카페거리", location: "부산진구 · 오후 붐빔", crowdStatus: "혼잡", rate: 63, imageUrl: "https://tong.visitkorea.or.kr/cms/resource/60/3496960_image2_1.jpg" },
  { id: 4, name: "서면 먹자골목", location: "부산진구 · 저녁 피크", crowdStatus: "혼잡", rate: 58, imageUrl: "https://tong.visitkorea.or.kr/cms/resource/12/3014312_image2_1.JPG" },
  { id: 5, name: "광안리해변 테마거리", location: "수영구 · 저녁 붐빔", crowdStatus: "혼잡", rate: 54, imageUrl: "http://tong.visitkorea.or.kr/cms/resource/42/3071042_image2_1.JPG" },
  { id: 6, name: "해운대 동백섬", location: "해운대구 · 오후 붐빔", crowdStatus: "보통", rate: 45, imageUrl: "http://tong.visitkorea.or.kr/cms/resource/47/3350847_image2_1.jpg" },
  { id: 7, name: "서면1번가", location: "부산진구 · 저녁 피크", crowdStatus: "보통", rate: 41, imageUrl: "https://tong.visitkorea.or.kr/cms/resource/33/3496933_image2_1.jpg" },
  { id: 8, name: "미포항", location: "해운대구 · 오후 한산", crowdStatus: "보통", rate: 35, imageUrl: "http://tong.visitkorea.or.kr/cms/resource/22/3336622_image2_1.jpg" },
];

const mockRelaxedSpots: Spot[] = [
  { id: 1, name: "흰여울문화마을", location: "영도구 · 종일 한산", crowdStatus: "여유", rate: 12, imageUrl: "https://tong.visitkorea.or.kr/cms/resource/74/3495874_image2_1.jpg" },
  { id: 2, name: "태종대", location: "영도구 · 오전 추천", crowdStatus: "여유", rate: 18, imageUrl: "https://tong.visitkorea.or.kr/cms/resource/83/3506383_image2_1.jpg" },
  { id: 3, name: "부산시립미술관", location: "해운대구 · 한산한 수준", crowdStatus: "보통", rate: 38, imageUrl: "http://tong.visitkorea.or.kr/cms/resource/62/2712662_image2_1.jpg" },
  { id: 4, name: "아홉산 숲", location: "기장군 · 종일 한산", crowdStatus: "여유", rate: 8, imageUrl: "http://tong.visitkorea.or.kr/cms/resource/91/3309791_image2_1.jpg" },
  { id: 5, name: "민락수변공원", location: "수영구 · 오전 한산", crowdStatus: "여유", rate: 15, imageUrl: "https://tong.visitkorea.or.kr/cms/resource/66/3498366_image2_1.jpg" },
  { id: 6, name: "부산현대미술관", location: "사하구 · 종일 한산", crowdStatus: "여유", rate: 10, imageUrl: "https://tong.visitkorea.or.kr/cms/resource/95/3506195_image2_1.jpg" },
  { id: 7, name: "오륙도", location: "남구 · 종일 한산", crowdStatus: "여유", rate: 22, imageUrl: "https://tong.visitkorea.or.kr/cms/resource/20/3496820_image2_1.jpg" },
  { id: 8, name: "이기대", location: "남구 · 오전 추천", crowdStatus: "여유", rate: 20, imageUrl: "https://tong.visitkorea.or.kr/cms/resource/02/3496802_image2_1.jpg" },
];

type Props = {
  type?: CrowdType;
  spots?: Spot[];
};

function toSpots(list: CongestionSpot[]): Spot[] {
  return list.map((s, index) => ({
    id: index + 1,
    name: s.name,
    location: s.district ?? "",
    crowdStatus: s.level,
    rate: s.rate,
    imageUrl: s.imageUrl,
  }));
}

function CrowdCard({ spot, rank }: { spot: Spot; rank?: number }) {
  const router = useRouter();
  const style = CROWD_STYLE[spot.crowdStatus];

  return (
    <button
      onClick={() => router.push("/crowd")}
      className="group relative aspect-[4/5] w-[45%] shrink-0 snap-start overflow-hidden rounded-2xl bg-gray-200 text-left transition-transform duration-200 hover:-translate-y-1 sm:w-[31%] lg:w-[23%]"
    >
      {spot.imageUrl && (
        <Image
          src={spot.imageUrl}
          alt={spot.name}
          fill
          sizes="(max-width: 744px) 45vw, (max-width: 1280px) 31vw, 23vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      )}

      {/* 하단 그라데이션 (텍스트 가독성용) */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

      {/* 순위 배지 */}
      {rank !== undefined && (
        <span className="absolute left-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-[11px] font-bold text-white">
          {rank}
        </span>
      )}

      {/* 혼잡도 배지 */}
      <span
        className="absolute right-3 top-3 rounded-full px-2 py-0.5 text-[10px] font-bold"
        style={{ backgroundColor: style.bg, color: style.text }}
      >
        {style.label}
      </span>

      {/* 하단 텍스트 */}
      <div className="absolute inset-x-0 bottom-0 p-3">
        <p className="truncate text-sm font-bold text-white">{spot.name}</p>
        <div className="mt-1 flex items-center justify-between gap-2">
          <p className="truncate text-[11px] text-white/70">{spot.location}</p>
          {spot.rate !== undefined && (
            <span className="shrink-0 text-[11px] font-bold tabular-nums text-white">
              {Math.round(spot.rate)}%
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

export default function SpotsPreviewSection({ type = "crowd", spots }: Props) {
  const router = useRouter();
  const isCrowd = type === "crowd";
  const scrollRef = useRef<HTMLDivElement>(null);

  // 혼잡도 실데이터: 붐빌 곳=집중률 상위 8, 여유로운 곳=하위 8 (prop > 실데이터 > mock)
  // congestion은 구 목록이라 캐시가 비어도(attractions: []) length가 0이 아니므로,
  // 실제로 뽑아낸 관광지 목록이 비었는지로 다시 판단해야 mock으로 제대로 대체된다.
  const { data: congestion } = useCongestion();
  const congestionSpots = congestion?.length
    ? (isCrowd ? getTopCongested(congestion, 8) : getLeastCongested(congestion, 8))
    : [];
  const realSpots = congestionSpots.length ? toSpots(congestionSpots) : undefined;

  const data = spots ?? realSpots ?? (isCrowd ? mockCrowdSpots : mockRelaxedSpots);

  const scrollByCard = (direction: 1 | -1) => {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = el.firstElementChild instanceof HTMLElement
      ? el.firstElementChild.offsetWidth + 12
      : el.clientWidth / 4;
    el.scrollBy({ left: direction * cardWidth * 2, behavior: "smooth" });
  };

  return (
    <section className="py-6 md:py-10">
      {/* 헤더 */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex flex-col gap-1">
          <span className={`text-xs font-semibold ${isCrowd ? "text-red-500" : "text-blue-500"}`}>
            {isCrowd ? "오늘 붐빌 곳" : "오늘 여유로운 곳"}
          </span>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900">
            {isCrowd ? "사람 많을 곳 미리 알기" : "붐빔 피해서 한가하게"}
          </h2>
          <p className="text-xs text-gray-400">
            {isCrowd ? "관광공사 혼잡도 예측 · 오늘 기준" : "사람 많은 곳이 부담스럽다면"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => scrollByCard(-1)}
            aria-label="이전"
            className="hidden h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-gray-400 transition-colors hover:border-gray-300 hover:text-gray-700 sm:flex"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => scrollByCard(1)}
            aria-label="다음"
            className="hidden h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-gray-400 transition-colors hover:border-gray-300 hover:text-gray-700 sm:flex"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          {isCrowd && (
            <button
              onClick={() => router.push("/crowd")}
              className="text-sm text-gray-500 border border-gray-200 rounded-lg px-3 py-1.5"
            >
              전체보기
            </button>
          )}
        </div>
      </div>

      {/* 카드 슬라이드 */}
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-1"
      >
        {data.map((spot, index) => (
          <CrowdCard key={spot.id} spot={spot} rank={isCrowd ? index + 1 : undefined} />
        ))}
      </div>
    </section>
  );
}
