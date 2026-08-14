"use client";

import { useRouter } from "next/navigation";

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
  /** 실데이터일 때만 채워짐 — 있으면 막대바로 집중률(%)을 보여준다 */
  rate?: number;
};

// 혼잡도는 사진이 아니라 순위/수치 데이터라 카드+이미지보다 리스트+막대바가 더
// 잘 맞는다 (실데이터에 이미지가 없는 경우가 많아 카드 형식일 때 빈 이미지가 반복되던 문제도 해결).
// 백엔드 혼잡도 API가 관광지별(attractions) 데이터를 아직 안 채워줄 때 쓰는
// 대체 데이터 — rate를 함께 채워서 실데이터와 동일하게 막대바 UI로 보이게 한다.
const mockCrowdSpots: Spot[] = [
  { id: 1, name: "광안리 해수욕장", location: "해운대구 · 14-17시 피크", crowdStatus: "매우혼잡", rate: 92 },
  { id: 2, name: "해운대 해수욕장", location: "해운대구 · 13-18시 피크", crowdStatus: "매우혼잡", rate: 87 },
  { id: 3, name: "전포 카페거리", location: "부산진구 · 오후 붐빔", crowdStatus: "혼잡", rate: 63 },
  { id: 4, name: "서면 먹자골목", location: "부산진구 · 저녁 피크", crowdStatus: "혼잡", rate: 58 },
];

const mockRelaxedSpots: Spot[] = [
  { id: 1, name: "흰여울문화마을", location: "영도구 · 종일 한산", crowdStatus: "여유", rate: 12 },
  { id: 2, name: "태종대", location: "영도구 · 오전 추천", crowdStatus: "여유", rate: 18 },
  { id: 3, name: "부산시립미술관", location: "해운대구 · 한산한 수준", crowdStatus: "보통", rate: 38 },
  { id: 4, name: "아홉산 숲", location: "기장군 · 종일 한산", crowdStatus: "여유", rate: 8 },
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
  }));
}

function CrowdRow({ spot, rank }: { spot: Spot; rank?: number }) {
  const router = useRouter();
  const style = CROWD_STYLE[spot.crowdStatus];

  return (
    <button
      onClick={() => router.push("/crowd")}
      className="flex w-full items-center gap-3 rounded-2xl border border-gray-100 bg-white px-4 py-3 text-left transition-all hover:border-gray-200 hover:shadow-sm active:scale-[0.99]"
    >
      {rank !== undefined && (
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-900 text-[11px] font-bold text-white">
          {rank}
        </span>
      )}
      <div className="min-w-0 flex-1">
        <div className="mb-1.5 flex items-center justify-between gap-2">
          <p className="truncate text-sm font-semibold text-gray-900">{spot.name}</p>
          <span
            className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold"
            style={{ backgroundColor: style.bg, color: style.text }}
          >
            {style.label}
          </span>
        </div>
        {spot.rate !== undefined ? (
          <div className="flex items-center gap-2">
            {/* 메터: 채워진 부분은 상태색, 트랙은 같은 색의 옅은 톤(같은 색 계열 전체로 상태가 읽히게) */}
            <div
              className="h-2 flex-1 overflow-hidden rounded-full"
              style={{ backgroundColor: `${style.bg}1f` }}
            >
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(Math.max(spot.rate, 4), 100)}%`,
                  backgroundColor: style.bg,
                }}
              />
            </div>
            <span
              className="shrink-0 text-[11px] font-bold tabular-nums"
              style={{ color: style.bg }}
            >
              {Math.round(spot.rate)}%
            </span>
          </div>
        ) : (
          <p className="truncate text-[11px] text-gray-400">{spot.location}</p>
        )}
      </div>
    </button>
  );
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

      {/* 리스트 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
        {data.map((spot, index) => (
          <CrowdRow key={spot.id} spot={spot} rank={isCrowd ? index + 1 : undefined} />
        ))}
      </div>
    </section>
  );
}
