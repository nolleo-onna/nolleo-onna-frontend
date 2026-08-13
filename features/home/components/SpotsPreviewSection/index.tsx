"use client";

import { useRouter } from "next/navigation";

import SpotCard from "@/components/ui/Card/SpotCard";
import { useCongestion } from "@/features/home/hooks/useCongestion";
import {
  getTopCongested,
  getLeastCongested,
  type CongestionSpot,
} from "@/features/home/utils/congestion";

type CrowdType = "crowd" | "relaxed";

type Spot = {
  id: number;
  imageSrc: string;
  name: string;
  location: string;
  rating: number;
  reviewCount: string;
  crowdStatus: "매우혼잡" | "혼잡" | "보통" | "여유";
  price?: number | null;
};

const mockCrowdSpots: Spot[] = [
  { id: 1, imageSrc: "https://picsum.photos/seed/gwangan/400/300", name: "광안리 해수욕장", location: "해운대구 · 14-17시 피크", rating: 4.6, reviewCount: "1.8k", crowdStatus: "매우혼잡", price: null },
  { id: 2, imageSrc: "https://picsum.photos/seed/haeundae/400/300", name: "해운대 해수욕장", location: "해운대구 · 13-18시 피크", rating: 4.8, reviewCount: "2.1k", crowdStatus: "매우혼잡", price: null },
  { id: 3, imageSrc: "https://picsum.photos/seed/jeonpo/400/300", name: "전포 카페거리", location: "부산진구 · 오후 붐빔", rating: 4.5, reviewCount: "980", crowdStatus: "혼잡", price: null },
  { id: 4, imageSrc: "https://picsum.photos/seed/seomyeon/400/300", name: "서면 먹자골목", location: "부산진구 · 저녁 피크", rating: 4.3, reviewCount: "760", crowdStatus: "혼잡", price: null },
];

const mockRelaxedSpots: Spot[] = [
  { id: 1, imageSrc: "https://picsum.photos/seed/huinnyeoul/400/300", name: "흰여울문화마을", location: "영도구 · 종일 한산", rating: 4.7, reviewCount: "540", crowdStatus: "여유", price: null },
  { id: 2, imageSrc: "https://picsum.photos/seed/taejongdae/400/300", name: "태종대", location: "영도구 · 오전 추천", rating: 4.8, reviewCount: "1.2k", crowdStatus: "여유", price: null },
  { id: 3, imageSrc: "https://picsum.photos/seed/museum/400/300", name: "부산시립미술관", location: "해운대구 · 항소 수준", rating: 4.2, reviewCount: "320", crowdStatus: "보통", price: 0 },
  { id: 4, imageSrc: "https://picsum.photos/seed/forest/400/300", name: "아홉산 숲", location: "기장군 · 종일 한산", rating: 4.6, reviewCount: "280", crowdStatus: "여유", price: null },
];

type Props = {
  type?: CrowdType;
  spots?: Spot[];
};

// 백엔드가 이미지를 주지 않을 때 사용할 기본 이미지
const DEFAULT_SPOT_IMAGE = "/images/default-spot.svg";

// 혼잡도 데이터를 카드(Spot) 형태로 변환.
// overlay 카드는 이미지/이름/위치/혼잡도만 표시하므로 rating/reviewCount/price는 표시에 쓰이지 않는다.
function toSpots(list: CongestionSpot[]): Spot[] {
  return list.map((s, index) => ({
    id: index + 1,
    imageSrc: s.imageUrl ?? DEFAULT_SPOT_IMAGE,
    name: s.name,
    location: s.district ? `${s.district} · 집중률 ${s.rate}%` : `집중률 ${s.rate}%`,
    rating: 0,
    reviewCount: "",
    crowdStatus: s.level,
    price: null,
  }));
}

export default function SpotsPreviewSection({ type = "crowd", spots }: Props) {
  const router = useRouter();
  const isCrowd = type === "crowd";

  // 혼잡도 실데이터: 붐빌 곳=집중률 상위 4, 여유로운 곳=하위 4 (prop > 실데이터 > mock)
  // congestion은 구 목록이라 캐시가 비어도(attractions: []) length가 0이 아니므로,
  // 실제로 뽑아낸 관광지 목록이 비었는지로 다시 판단해야 mock으로 제대로 대체된다.
  const { data: congestion } = useCongestion();
  const congestionSpots = congestion?.length
    ? (isCrowd ? getTopCongested(congestion, 4) : getLeastCongested(congestion, 4))
    : [];
  const realSpots = congestionSpots.length ? toSpots(congestionSpots) : undefined;

  const data = spots ?? realSpots ?? (isCrowd ? mockCrowdSpots : mockRelaxedSpots);

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
        {isCrowd && (
          <button
            onClick={() => router.push("/crowd")}
            className="text-sm text-gray-500 border border-gray-200 rounded-lg px-3 py-1.5"
          >
            전체보기
          </button>
        )}
      </div>

      {/* 카드 그리드 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {data.map((spot, index) => (
          <SpotCard
            key={spot.id}
            variant="overlay"
            imageSrc={spot.imageSrc}
            name={spot.name}
            location={spot.location}
            rating={spot.rating}
            reviewCount={spot.reviewCount}
            crowdStatus={spot.crowdStatus}
            price={spot.price}
            onClick={() => router.push("/crowd")}
            topLeftSlot={
              isCrowd ? (
                <span className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-900 text-white text-xs font-bold">
                  {index + 1}
                </span>
              ) : undefined
            }
          />
        ))}
      </div>
    </section>
  );
}
