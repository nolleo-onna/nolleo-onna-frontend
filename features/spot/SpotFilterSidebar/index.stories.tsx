import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import SpotFilterSidebar from "./index";
import type { WeatherObservation } from "@/types/weather";

// 기상청 응답과 같은 모양의 샘플 — 날씨 카드가 비어 보이지 않게
const WEATHER: WeatherObservation[] = [
  { district: "부산", tmp: 24, pty: 0, wsd: 2.4, reh: 55, rn1: null },
  { district: "동래구", tmp: 25, pty: 0, wsd: 5.1, reh: 60, rn1: null },
];

const meta = {
  title: "Spot/SpotFilterSidebar",
  component: SpotFilterSidebar,
  args: { onSelectRegion: () => {} },
  parameters: {
    layout: "fullscreen",
    nextjs: { appDirectory: true, navigation: { pathname: "/spot" } },
  },
  decorators: [
    (Story) => {
      const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false, staleTime: Infinity } },
      });
      queryClient.setQueryData(["weather", "all"], WEATHER);
      return (
        <QueryClientProvider client={queryClient}>
          <div className="flex h-screen bg-gray-50">
            <div className="w-[300px] shrink-0">
              <Story />
            </div>
          </div>
        </QueryClientProvider>
      );
    },
  ],
} satisfies Meta<typeof SpotFilterSidebar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { name: "아무것도 안 고른 상태" };

// 지역·카테고리·예산을 고른 상태 — 위쪽 "고른 조건" 칩과 카테고리 타일 색 확인
export const Filtered: Story = {
  name: "지역 · 카테고리 · 예산 고른 상태",
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: "/spot",
        // 스토리북 navigation은 같은 키를 여러 번 주지 못해 하나만 건다
        // (실제 URL은 ?category=NA&category=FD 처럼 반복된다)
        query: { region: "동래구", category: "NA", budget: "50000" },
      },
    },
  },
};
