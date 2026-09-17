import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import AIChatProvider from "@/providers/AIChatProvider";
import HeroSection from "./index";
import HeroChatCenter from "./aiFirst/HeroChatCenter";
import HeroChatShowcase from "./aiFirst/HeroChatShowcase";
import HeroModeSwitch from "./aiFirst/HeroModeSwitch";

// 피드백: 히어로에서 온나 채팅이 메인인데 "온나에게 물어보기"가 검색 카드 구석의 작은 버튼이라 안 보인다.
// 1순위 AI 채팅, 2순위 내 코스 만들기가 되도록 다시 짠 시안들. 누르면 실제 채팅 모달이 열린다.
const meta = {
  title: "Home/HeroSection/AI 채팅 우선 시안",
  parameters: { layout: "fullscreen", nextjs: { appDirectory: true, navigation: { pathname: "/" } } },
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

export const Current: Story = { name: "지금 · 비교용", render: () => <HeroSection /> };

export const AChatCenter: Story = { name: "A · 대화창이 곧 히어로", render: () => <HeroChatCenter /> };

export const BChatShowcase: Story = { name: "B · 온나가 먼저 보여주는 히어로", render: () => <HeroChatShowcase /> };

export const CModeSwitch: Story = { name: "C · 모드 전환 카드", render: () => <HeroModeSwitch /> };
