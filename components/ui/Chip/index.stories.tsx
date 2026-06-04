import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import Chip from "./index";

const meta = {
  title: "UI/Chip",
  component: Chip,

  tags: ["autodocs"],

  argTypes: {
    variant: {
      control: "select",
      options: ["default", "selected", "outline"],
    },

    size: {
      control: "select",
      options: ["sm", "md"],
    },
  },
} satisfies Meta<typeof Chip>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: "해운대",
  },
};

export const Selected: Story = {
  args: {
    children: "감성카페",
    variant: "selected",
  },
};

export const Outline: Story = {
  args: {
    children: "야경",
    variant: "outline",
  },
};