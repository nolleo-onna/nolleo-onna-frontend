import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import CourseCarousel from "./index";

const meta: Meta<typeof CourseCarousel> = {
  title: "Home/CourseCarousel",
  component: CourseCarousel,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof CourseCarousel>;

export const Default: Story = {};