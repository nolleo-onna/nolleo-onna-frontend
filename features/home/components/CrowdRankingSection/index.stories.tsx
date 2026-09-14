import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import CrowdRankingSection from "./index";

// useCongestion(react-query)가 QueryClientProvider를 필요로 해서 스토리 전용으로 감싸줌.
// 스토리에선 API가 없어 대체 데이터(crowdFallbackSpots)로 그려진다.
const meta = {
  title: "Home/CrowdRankingSection",
  component: CrowdRankingSection,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen", nextjs: { appDirectory: true } },
  decorators: [
    (Story) => {
      const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } },
      });
      return (
        <QueryClientProvider client={queryClient}>
          <div className="bg-gray-50 px-8">
            <Story />
          </div>
        </QueryClientProvider>
      );
    },
  ],
} satisfies Meta<typeof CrowdRankingSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
