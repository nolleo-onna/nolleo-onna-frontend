import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import Dropdown from "./index";

const meta = {
  title: "UI/Dropdown",
  component: Dropdown,
} satisfies Meta<typeof Dropdown>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Budget: Story = {
  args: {
    placeholder: "💰 50,000원",
    options: [
      {
        label: "무지출",
        value: "0",
      },
      {
        label: "1만원",
        value: "10000",
      },
      {
        label: "3만원",
        value: "30000",
      },
      {
        label: "5만원",
        value: "50000",
      },
      {
        label: "제한 없음",
        value: "all",
      },
    ],
  },
};