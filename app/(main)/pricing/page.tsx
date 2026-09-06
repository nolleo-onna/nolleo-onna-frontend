import type { Metadata } from "next";

import PlanCards from "@/features/subscription/components/PlanCards";

export const metadata: Metadata = {
  title: "요금제 | 놀러온나",
};

export default function PricingPage() {
  return (
    <main className="mx-auto w-full max-w-[1280px] px-5 pt-28 pb-20 md:px-10 lg:px-20">
      <header className="text-center">
        <p className="text-xs font-semibold tracking-widest text-ocean-600 uppercase">
          Pricing
        </p>
        <h1 className="mt-2 text-3xl font-bold text-navy-900">
          내 여행 스타일에 맞는 플랜
        </h1>
        <p className="mt-3 text-sm text-gray-500">
          AI 코스 생성과 채팅 한도를 플랜에 따라 넉넉하게 늘릴 수 있어요.
        </p>
      </header>

      <div className="mt-10">
        <PlanCards />
      </div>
    </main>
  );
}
