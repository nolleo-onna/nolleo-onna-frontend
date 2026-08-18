import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import CourseSection from "./index";

const meta = {
  title: "Home/CourseSection",
  component: CourseSection,
  tags: ["autodocs"],
} satisfies Meta<typeof CourseSection>;

export default meta;
type Story = StoryObj<typeof CourseSection>;

export const Default: Story = {};