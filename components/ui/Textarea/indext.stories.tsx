import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import Textarea from "./index";

const meta = {
  title: "UI/Textarea",
  component: Textarea,

  tags: ["autodocs"],

  argTypes: {
    variant: {
      control: "select",
      options: ["default", "error", "disabled"],
    },
  },
} satisfies Meta<typeof Textarea>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder:
      "원하는 여행 스타일을 입력해주세요.",
    rows: 5,
  },
};

export const Error: Story = {
  args: {
    placeholder: "에러 상태",
    variant: "error",
    rows: 5,
  },
};

export const Disabled: Story = {
  args: {
    placeholder: "비활성화 상태",
    variant: "disabled",
    disabled: true,
    rows: 5,
  },
};