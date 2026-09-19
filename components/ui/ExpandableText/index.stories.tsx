import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import ExpandableText from "./index";

// 스팟 상세에서 쓰는 긴 설명 접기/펼치기. 실제로 잘리던 관광공사 overview 길이로 본다.
const LONG = `해운대해수욕장은 부산광역시 해운대구에 있는 대한민국 대표 해수욕장이다. 백사장 길이 1.5km, 폭 30~50m, 면적 58,400㎡ 규모로 매년 여름 전국에서 가장 많은 피서객이 찾는 곳이다.
완만한 수심과 잔잔한 물결, 그리고 해운대를 둘러싼 동백섬과 오륙도, 달맞이길이 어우러져 사계절 내내 관광객이 끊이지 않는다. 해변을 따라 늘어선 고층 호텔과 카페, 횟집에서는 바다를 보며 식사를 즐길 수 있고, 밤에는 광안대교의 야경과 해변 조명이 어우러져 색다른 분위기를 만든다.
겨울에는 북극곰 수영대회, 여름에는 부산바다축제와 모래축제 등 계절마다 다양한 행사가 열린다. 인근에 누리마루 APEC하우스, 동백공원, 해운대 블루라인파크 해변열차가 있어 함께 둘러보기 좋다. 지하철 2호선 해운대역에서 걸어서 약 10분 거리이며, 주변에 공영주차장이 있으나 성수기에는 대중교통 이용을 권한다.`;

const SHORT = "광안리 바다가 보이는 작은 카페입니다. 직접 볶은 원두로 내린 커피를 팝니다.";

const meta = {
  title: "UI/긴 설명 접기·펼치기",
  component: ExpandableText,
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <div className="w-[520px] max-w-full rounded-[24px] bg-white p-5 shadow-[0_12px_32px_-16px_rgba(13,48,128,0.3)]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ExpandableText>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Long: Story = {
  name: "긴 설명 — 5줄에서 접고 더 보기",
  args: {
    children: LONG,
    className: "rounded-2xl border border-white/60 bg-gradient-to-br from-ocean-50/60 to-ocean-100/30 p-4",
    fadeClassName: "from-ocean-50/80",
  },
};

export const Short: Story = {
  name: "짧은 설명 — 버튼 없음",
  args: {
    children: SHORT,
    className: "rounded-2xl border border-white/60 bg-gradient-to-br from-amber-50/60 to-orange-50/30 p-4",
    fadeClassName: "from-amber-50/80",
  },
};
