import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import SpotsPreviewSection from "./index";

const meta = {
  title: "Home/SpotsPreviewSection",
  component: SpotsPreviewSection,
  tags: ["autodocs"],
} satisfies Meta<typeof SpotsPreviewSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Crowd: Story = {
  args: { type: "crowd" },
};

export const Relaxed: Story = {
  args: { type: "relaxed" },
};