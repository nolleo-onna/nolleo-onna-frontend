import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import TodayStrip from "./index";

// useWeather / useCongestion(react-query)가 QueryClientProvider를 필요로 해서 스토리 전용으로 감싸줌
const meta: Meta<typeof TodayStrip> = {
  title: "Home/TodayStrip",
  component: TodayStrip,
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
type Story = StoryObj<typeof TodayStrip>;

export const Default: Story = {};
