import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import Input from "./index";

const meta = {
  title: "UI/Input",
  component: Input,

  tags: ["autodocs"],

  argTypes: {
    variant: {
      control: "select",
      options: ["default", "error", "disabled"],
    },

    inputSize: {
      control: "select",
      options: ["sm", "md", "lg"],
    },
  },
} satisfies Meta<typeof Input>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: "입력해주세요",
    variant: "default",
    inputSize: "md",
  },
};

export const Error: Story = {
  args: {
    placeholder: "에러 상태입니다",
    variant: "error",
    inputSize: "md",
  },
};

export const Disabled: Story = {
  args: {
    placeholder: "비활성화 상태",
    variant: "disabled",
    inputSize: "md",
    disabled: true,
  },
};