import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import HeroSection from "./index";
import CardPackHero from "./concepts/CardPackHero";
import ChatDemoHero from "./concepts/ChatDemoHero";
import CompanionHero from "./concepts/CompanionHero";
import DayTimelineHero from "./concepts/DayTimelineHero";
import MosaicHero from "./concepts/MosaicHero";
import RouteDrawHero from "./concepts/RouteDrawHero";
import SlotHero from "./concepts/SlotHero";
import AIChatProvider from "@/providers/AIChatProvider";

// 홈 히어로의 긴 문구 자리에 무엇을 넣을지 비교하는 시안들. 파도 배경과 검색바는 지금 홈과 같다.
const meta = {
  title: "Home/HeroSection/Concepts",
  parameters: { layout: "fullscreen", nextjs: { appDirectory: true } },
  decorators: [
    (Story) => {
      const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
      return (
        <QueryClientProvider client={queryClient}>
          <AIChatProvider>
            <div className="min-h-screen bg-gray-50">
              <Story />
            </div>
          </AIChatProvider>
        </QueryClientProvider>
      );
    },
  ],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Current: Story = { name: "지금 · 문구형", render: () => <HeroSection /> };

export const AChatDemo: Story = { name: "A · 말하면 코스가 나오는 대화", render: () => <ChatDemoHero /> };

export const BRouteMap: Story = { name: "B · 지도 위에 그려지는 코스", render: () => <RouteDrawHero /> };

export const CCardPack: Story = { name: "C · 오늘의 코스 팩", render: () => <CardPackHero /> };

export const DSlot: Story = { name: "D · 오늘 뭐하지 슬롯머신", render: () => <SlotHero /> };

export const EDayTimeline: Story = { name: "E · 아침부터 밤까지 하루 시간표", render: () => <DayTimelineHero /> };

export const FPhotoWall: Story = { name: "F · 흐르는 부산 사진 벽", render: () => <MosaicHero /> };

export const GCompanion: Story = { name: "G · 누구랑 가요? 동행별 미리보기", render: () => <CompanionHero /> };
