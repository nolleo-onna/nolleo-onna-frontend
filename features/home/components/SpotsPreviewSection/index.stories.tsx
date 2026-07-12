import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import SpotsPreviewSection from "./index";

// useCongestion(react-query)가 QueryClientProvider를 필요로 해서 스토리 전용으로 감싸줌
const meta = {
  title: "Home/SpotsPreviewSection",
  component: SpotsPreviewSection,
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
} satisfies Meta<typeof SpotsPreviewSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Crowd: Story = {
  args: { type: "crowd" },
};

export const Relaxed: Story = {
  args: { type: "relaxed" },
};
