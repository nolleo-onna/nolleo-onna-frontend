import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import HeroSection from "./index";

const meta: Meta<typeof HeroSection> = {
  title: "Home/HeroSection",
  component: HeroSection,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof HeroSection>;

export const Default: Story = {};