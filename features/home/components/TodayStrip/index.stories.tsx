import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import TodayStrip from "./index";
import { CONGESTION_QUERY_KEY } from "@/features/home/hooks/useCongestion";

import type { Congestion } from "@/types/congestion";
import type { PtyCode, WeatherObservation } from "@/types/weather";

// 2026-09-14 실제 날씨 응답을 옮긴 값(구, 기온, 습도, 풍속)과 예시 혼잡도. 스토리마다 강수·바람만 바꿔 하늘 장면을 본다
const BASE: [district: string, tmp: number, reh: number, wsd: number, rate: number][] = [
  ["해운대구", 23.7, 59, 0.7, 49.6],
  ["수영구", 23, 68, 3.3, 45.9],
  ["부산진구", 25.5, 57, 1.7, 55.1],
  ["영도구", 25.5, 57, 1.7, 43.9],
  ["중구", 25.5, 57, 1.7, 62.6],
  ["기장군", 23.6, 67, 1.8, 33.3],
  ["동래구", 23.7, 59, 0.7, 39.3],
  ["북구", 26, 53, 2, 30.1],
  ["사하구", 24.3, 73, 8.9, 41.9],
  ["강서구", 24.3, 68, 0.9, 45.3],
  ["연제구", 23, 68, 3.3, 37.8],
  ["사상구", 26, 53, 2, 40.1],
];

function weatherWith(pty: PtyCode, rn1: number, windBoost = 0): WeatherObservation[] {
  return BASE.map(([district, tmp, reh, wsd]) => ({
    district,
    tmp,
    pty,
    reh,
    wsd: Math.round((wsd + windBoost) * 10) / 10,
    rn1,
  }));
}

const CONGESTION: Congestion[] = BASE.map(([districtName, , , , rate]) => ({
  districtName,
  rate,
  baseYmd: "20260914",
  attractions: [],
}));

// useWeather / useCongestion 캐시를 미리 채워 API 없이 그린다
const meta = {
  title: "Home/TodayStrip",
  component: TodayStrip,
  tags: ["autodocs"],
  parameters: { weather: weatherWith(0, 0) },
  decorators: [
    (Story, { parameters }) => {
      const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false, staleTime: Infinity } },
      });
      queryClient.setQueryData(["weather", "all"], parameters.weather as WeatherObservation[]);
      queryClient.setQueryData(CONGESTION_QUERY_KEY, CONGESTION);
      return (
        <QueryClientProvider client={queryClient}>
          <div className="mx-auto max-w-[1200px]">
            <Story />
          </div>
        </QueryClientProvider>
      );
    },
  ],
} satisfies Meta<typeof TodayStrip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const RainyAndWindy: Story = {
  parameters: { weather: weatherWith(1, 4.5, 5) },
};

export const Snowy: Story = {
  parameters: { weather: weatherWith(3, 1.2) },
};
