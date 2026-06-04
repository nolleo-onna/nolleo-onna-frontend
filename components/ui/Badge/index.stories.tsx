import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import Badge from "./index";

const meta = {
  title: "UI/Badge",
  component: Badge,
  tags: ["autodocs"],

  argTypes: {
    variant: {
      control: "select",
      options: [
        "default",
        "official",
        "hot",
        "crowd",
        "relaxed",
        "ai",
        "free",
      ],
    },
  },
} satisfies Meta<typeof Badge>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: "기본",
    variant: "default",
  },
};

export const Official: Story = {
  args: {
    children: "관광공사",
    variant: "official",
  },
};

export const Hot: Story = {
  args: {
    children: "🔥 인기",
    variant: "hot",
  },
};

export const Crowd: Story = {
  args: {
    children: "혼잡",
    variant: "crowd",
  },
};

export const Relaxed: Story = {
  args: {
    children: "🌿 여유",
    variant: "relaxed",
  },
};

export const AI: Story = {
  args: {
    children: "✨ AI 추천",
    variant: "ai",
  },
};

export const Free: Story = {
  args: {
    children: "무료",
    variant: "free",
  },
};

export const Showcase: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      <Badge variant="official">관광공사</Badge>
      <Badge variant="hot">🔥 인기</Badge>
      <Badge variant="crowd">혼잡</Badge>
      <Badge variant="relaxed">🌿 여유</Badge>
      <Badge variant="ai">✨ AI 추천</Badge>
      <Badge variant="free">무료</Badge>
    </div>
  ),
};