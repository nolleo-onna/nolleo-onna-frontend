"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import { motion } from "motion/react";

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
      className="group relative aspect-[3/4] w-[calc((100%-12px)/2)] shrink-0 snap-start overflow-hidden rounded-3xl bg-gray-200 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg sm:w-[calc((100%-24px)/3)] lg:w-[calc((100%-36px)/4)]"
    >
      {spot.imageUrl ? (
        <Image
          src={spot.imageUrl}
          alt={spot.name}
          fill
          sizes="(max-width: 744px) 50vw, (max-width: 1280px) 33vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        // 관광공사 혼잡도 API는 이미지를 안 내려줘서, 대신 브랜드 톤 배경 +
        // 핀 아이콘으로 채운다(빈 회색 박스로 보이지 않게).
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-navy-700 to-ocean-600">
          <MapPin className="h-9 w-9 text-white/25" strokeWidth={1.5} />
        </div>
      )}

      {/* 하단 그라데이션 (텍스트 가독성용) */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/5 to-transparent" />

      {/* 순위 배지 */}
      {rank !== undefined && (
        <span className="absolute left-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-white/25 text-[11px] font-bold text-white backdrop-blur-sm">
          {rank}
        </span>
      )}

      {/* 혼잡도 + 집중률 배지 */}
      <span
        className="absolute right-3 top-3 flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold backdrop-blur-sm"
        style={{ backgroundColor: `${style.bg}e6`, color: style.text }}
      >
        {style.label}
        {spot.rate !== undefined && (
          <span className="tabular-nums opacity-80">{Math.round(spot.rate)}%</span>
        )}
      </span>

      {/* 하단 텍스트 */}
      <div className="absolute inset-x-0 bottom-0 p-4">
        <p className="truncate text-[15px] font-bold text-white">{spot.name}</p>
        <p className="mt-0.5 truncate text-[11px] text-white/70">{spot.location}</p>
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

  // 카드 목록을 두 벌 이어 붙여 놓고, 두 번째 벌 영역에 들어서면 화면상 똑같이
  // 보이는 첫 벌의 같은 위치로 순간 이동(사용자에겐 안 보임)시킨 뒤 계속 앞으로
  // 스크롤한다 — 마지막 카드에서 처음으로 되감기지 않고 자연스럽게 이어진다.
  const scrollByCard = (direction: 1 | -1) => {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = el.firstElementChild instanceof HTMLElement
      ? el.firstElementChild.getBoundingClientRect().width + 12
      : el.clientWidth / 4;
    const half = el.scrollWidth / 2;

    let current = el.scrollLeft;
    if (direction === 1 && current >= half) {
      current -= half;
      el.scrollLeft = current;
    } else if (direction === -1 && current < cardWidth) {
      current += half;
      el.scrollLeft = current;
    }

    el.scrollTo({ left: current + direction * cardWidth, behavior: "smooth" });
  };

  // 3초마다 카드 한 칸씩 자동으로 넘어간다. 마우스가 올라와 있거나 직접
  // 스크롤/드래그 중이면 멈추고, 손을 뗀 뒤 잠깐 지나면 다시 시작한다.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    let isHovering = false;
    let interactionCooldownUntil = 0;

    const handleMouseEnter = () => {
      isHovering = true;
    };
    const handleMouseLeave = () => {
      isHovering = false;
    };
    const handleInteraction = () => {
      interactionCooldownUntil = Date.now() + 3000;
    };

    const intervalId = setInterval(() => {
      if (!isHovering && Date.now() > interactionCooldownUntil) {
        scrollByCard(1);
      }
    }, 3000);

    el.addEventListener("mouseenter", handleMouseEnter);
    el.addEventListener("mouseleave", handleMouseLeave);
    el.addEventListener("pointerdown", handleInteraction);
    el.addEventListener("wheel", handleInteraction, { passive: true });

    return () => {
      clearInterval(intervalId);
      el.removeEventListener("mouseenter", handleMouseEnter);
      el.removeEventListener("mouseleave", handleMouseLeave);
      el.removeEventListener("pointerdown", handleInteraction);
      el.removeEventListener("wheel", handleInteraction);
    };
  }, [data]);

  return (
    <motion.section
      className="py-6 md:py-10"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
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
        {/* 무한 루프용으로 같은 목록을 두 벌 렌더링 (scrollByCard 참고) */}
        {[...data, ...data].map((spot, index) => (
          <CrowdCard
            key={`${index < data.length ? "a" : "b"}-${spot.id}`}
            spot={spot}
            rank={isCrowd ? (index % data.length) + 1 : undefined}
          />
        ))}
      </div>
    </motion.section>
  );
}
