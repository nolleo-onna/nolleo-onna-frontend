import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import ServiceIntroSection from "./index";

const meta = {
  title: "Home/ServiceIntroSection",
  component: ServiceIntroSection,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    viewport: { defaultViewport: "desktop" },
  },
} satisfies Meta<typeof ServiceIntroSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="bg-gray-50 px-8 py-4">
      <ServiceIntroSection />
    </div>
  ),
};