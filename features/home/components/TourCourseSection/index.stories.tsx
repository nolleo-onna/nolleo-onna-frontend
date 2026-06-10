import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import TourCourseSection from "./index";

const meta = {
  title: "Home/TourCourseSection",
  component: TourCourseSection,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    viewport: {
      defaultViewport: "desktop",
    },
  },
} satisfies Meta<typeof TourCourseSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <div className="p-8">
      <TourCourseSection {...args} />
    </div>
  ),
};

export const Mobile: Story = {
  parameters: {
    viewport: { defaultViewport: "mobile1" },
  },
  render: (args) => (
    <div className="p-4">
      <TourCourseSection {...args} />
    </div>
  ),
};