import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import SpotFilterSidebar from "../index";
import AccordionSidebar from "./AccordionSidebar";
import TabbedSidebar from "./TabbedSidebar";
import type { WeatherObservation } from "@/types/weather";

const WEATHER: WeatherObservation[] = [
  { district: "부산", tmp: 24, pty: 0, wsd: 2.4, reh: 55, rn1: null },
  { district: "동래구", tmp: 25, pty: 0, wsd: 5.1, reh: 60, rn1: null },
];

const noop = () => {};

// 스팟 왼쪽 필터 사이드바 시안 비교. C(떠 있는 카드)를 골라 화면에 적용했고, A·B는 비교용으로 남겨둔다.
const meta = {
  title: "Spot/필터 사이드바 시안",
  parameters: {
    layout: "fullscreen",
    // 지역·카테고리·예산을 고른 상태로 본다 (스토리북은 같은 키를 여러 번 주지 못해 카테고리는 하나만)
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: "/spot",
        query: { region: "동래구", category: "NA", budget: "50000" },
      },
    },
  },
  decorators: [
    (Story) => {
      const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false, staleTime: Infinity } },
      });
      queryClient.setQueryData(["weather", "all"], WEATHER);
      return (
        <QueryClientProvider client={queryClient}>
          <div className="flex h-screen bg-gray-100">
            <div className="w-[300px] shrink-0">
              <Story />
            </div>
            <div className="flex flex-1 items-center justify-center text-sm text-gray-400">
              지도 자리
            </div>
          </div>
        </QueryClientProvider>
      );
    },
  ],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Current: Story = {
  name: "지금 · 떠 있는 카드 (적용됨)",
  render: () => <SpotFilterSidebar onSelectRegion={noop} />,
};

export const Accordion: Story = {
  name: "A · 접었다 펴기 (쓰는 것만)",
  render: () => <AccordionSidebar onSelectRegion={noop} />,
};

export const Tabbed: Story = {
  name: "B · 탭 (스크롤 없음)",
  render: () => <TabbedSidebar onSelectRegion={noop} />,
};
