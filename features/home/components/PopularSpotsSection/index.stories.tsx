import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import PopularSpotsSection from "./index";

const meta = {
  title: "Home/PopularSpotsSection",
  component: PopularSpotsSection,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
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