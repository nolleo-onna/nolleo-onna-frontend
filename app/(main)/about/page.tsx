import type { Metadata } from "next";
import Link from "next/link";
import {
  CloudSun,
  Database,
  MapPin,
  Route,
  Sparkles,
  Users,
} from "lucide-react";

export const metadata: Metadata = {
  title: "서비스 소개 | 놀러온나",
};

const FEATURES = [
  {
    icon: MapPin,
    title: "스팟 탐색",
    description:
      "부산 전역의 관광지·맛집·카페를 지도에서 한눈에. 지역·카테고리·예산 필터로 취향에 맞는 곳만 골라볼 수 있어요.",
  },
  {
    icon: Sparkles,
    title: "AI 코스 추천",
    description:
      "\"광안리에서 연인과 반나절, 5만원\" — 조건만 말하면 AI가 동선과 예산을 고려한 맞춤 코스를 만들어드려요.",
  },
  {
    icon: Users,
    title: "혼잡도 예측",
    description:
      "관광공사 혼잡도 데이터로 오늘 붐빌 곳과 여유로운 곳을 미리 확인하고, 사람 많은 곳은 피해서 다닐 수 있어요.",
  },
  {
    icon: CloudSun,
    title: "실시간 날씨",
    description:
      "기상청 데이터 기반으로 부산 구별 기온·강수·바람을 보여줘요. 날씨에 맞춰 일정을 조정해보세요.",
  },
  {
    icon: Route,
    title: "예산 안에서 즐기기",
    description:
      "코스마다 예상 비용을 계산해서 보여줘요. 무지출 코스부터 넉넉한 코스까지, 예산이 계획의 출발점이 돼요.",
  },
  {
    icon: Database,
    title: "한끗 정보",
    description:
      "오늘 열리는 행사, 무료로 즐길 거리, 할인 팁까지 — 여행을 한 끗 더 알차게 만드는 소식을 모아뒀어요.",
  },
];

const DATA_SOURCES = [
  { name: "한국관광공사 TourAPI", role: "관광지·음식점 정보 및 사진" },
  { name: "한국관광공사 혼잡도 데이터", role: "관광지 혼잡도 예측" },
  { name: "기상청 공공데이터", role: "부산 구별 실시간 날씨" },
  { name: "카카오맵 API", role: "지도 및 위치 표시" },
];

export default function AboutPage() {
  return (
    <main className="mx-auto w-full max-w-[1280px] px-5 pt-28 pb-20 md:px-10 lg:px-20">
      {/* 히어로 */}
      <section className="relative overflow-hidden rounded-[28px] border border-gray-100 bg-gradient-to-br from-navy-800 via-navy-700 to-ocean-800 p-8 text-center md:p-14">
        <div className="pointer-events-none absolute -top-20 -left-16 h-64 w-64 rounded-full bg-ocean-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-12 h-72 w-72 rounded-full bg-lime-300/10 blur-3xl" />

        <p className="relative text-sm font-semibold text-lime-300">
          부산 특화 소비 여행 서비스
        </p>
        <h1 className="relative mt-3 text-3xl font-bold text-white md:text-4xl">
          오늘 부산, 뭐하지?
          <br />
          <span className="text-ocean-300">놀러온나</span>가 다 짜드릴게요
        </h1>
        <p className="relative mx-auto mt-4 max-w-xl text-sm leading-relaxed text-white/70 md:text-base">
          예산·동행·분위기만 말하면 AI가 코스를 만들고, 혼잡도와 날씨까지
          반영해요. 부산을 처음 찾는 여행자도, 매주 놀러 나가는 부산 사람도
          더 알차게 놀 수 있도록 만들었어요.
        </p>
        <div className="relative mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            className="rounded-full bg-lime-300 px-6 py-3 text-sm font-bold text-navy-900 transition-all hover:-translate-y-0.5 hover:brightness-105 active:scale-95"
          >
            코스 만들러 가기
          </Link>
          <Link
            href="/spot"
            className="rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-white/10 active:scale-95"
          >
            스팟 둘러보기
          </Link>
        </div>
      </section>

      {/* 핵심 기능 */}
      <section className="mt-14">
        <div className="text-center">
          <p className="text-xs font-semibold tracking-widest text-ocean-600 uppercase">
            Features
          </p>
          <h2 className="mt-2 text-2xl font-bold text-navy-900">
            놀러온나가 해드리는 것
          </h2>
        </div>
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="rounded-[28px] border border-gray-100 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-ocean-200 hover:shadow-[0_20px_40px_-16px_rgba(10,132,255,0.18)]"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-ocean-50">
                <Icon className="h-5 w-5 text-ocean-500" />
              </div>
              <h3 className="mt-4 text-base font-bold text-navy-900">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-500">
                {description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 데이터 출처 */}
      <section className="mt-14 rounded-[28px] border border-gray-100 bg-gray-50 p-6 md:p-10">
        <h2 className="text-lg font-bold text-navy-900">
          믿을 수 있는 공공데이터로 만들어요
        </h2>
        <p className="mt-2 text-sm text-gray-500">
          놀러온나의 여행 정보는 아래 공공데이터와 API를 기반으로 합니다.
        </p>
        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {DATA_SOURCES.map(({ name, role }) => (
            <div
              key={name}
              className="flex items-center justify-between gap-3 rounded-2xl border border-gray-100 bg-white px-5 py-4"
            >
              <span className="text-sm font-semibold text-navy-900">{name}</span>
              <span className="shrink-0 text-xs text-gray-500">{role}</span>
            </div>
          ))}
        </div>
        <p className="mt-4 text-[11px] leading-relaxed text-gray-400">
          본 서비스는 공모전 출품을 위해 제작된 비영리 데모 서비스입니다.
          제공되는 정보는 원천 데이터의 갱신 시점에 따라 실제와 다를 수
          있으니, 방문 전 운영시간·가격을 확인해주세요.
        </p>
      </section>
    </main>
  );
}
