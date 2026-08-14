import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import PopularSpotsSection from "./index";

// usePopularSpots(react-query)가 QueryClientProvider를 필요로 해서 스토리 전용으로 감싸줌
const meta = {
  title: "Home/PopularSpotsSection",
  component: PopularSpotsSection,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
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
} satisfies Meta<typeof PopularSpotsSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <div className="p-8">
      <PopularSpotsSection {...args} />
    </div>
  ),
};