import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import WeatherSection from "./index";

// useWeather(react-query)가 QueryClientProvider를 필요로 해서 스토리 전용으로 감싸줌
const meta: Meta<typeof WeatherSection> = {
  title: "Home/WeatherSection",
  component: WeatherSection,
  tags: ["autodocs"],
  decorators: [
    (Story) => {
      const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } },
      });
      return (
        <QueryClientProvider client={queryClient}>
          <Story />
        </QueryClientProvider>
      );
    },
  ],
};

export default meta;
type Story = StoryObj<typeof WeatherSection>;

// 실제 API 호출이 일어나며, 실패 시 컴포넌트의 에러 상태(날씨 정보를 불러오지 못했어요)가 보임
export const Default: Story = {};

export const Crowded: Story = {
  args: {
    dust: { grade: "보통", pm: 45, recommendation: "민감군 주의" },
    crowd: { grade: "매우혼잡", description: "주말 · 피크타임" },
  },
};
