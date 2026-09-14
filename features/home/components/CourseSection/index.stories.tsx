import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import CourseSection from "./index";
import AIChatProvider from "@/providers/AIChatProvider";

// "이 문장으로 코스 짜기"가 AI 채팅(AIChatProvider)을 열어서, 스토리에서도 Provider로 감싼다
const meta = {
  title: "Home/CourseSection",
  component: CourseSection,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen", nextjs: { appDirectory: true } },
  decorators: [
    (Story) => {
      const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } },
      });
      return (
        <QueryClientProvider client={queryClient}>
          <AIChatProvider>
            <div className="bg-gray-50 px-8">
              <Story />
            </div>
          </AIChatProvider>
        </QueryClientProvider>
      );
    },
  ],
} satisfies Meta<typeof CourseSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
