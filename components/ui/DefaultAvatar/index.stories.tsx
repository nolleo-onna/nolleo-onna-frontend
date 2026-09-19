import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import DefaultAvatar from "./index";

// 프로필 사진이 없는 사람에게 주는 기본 그림. 닉네임으로 셋 중 하나가 정해진다.
const meta = {
  title: "UI/기본 프로필 그림",
  component: DefaultAvatar,
  parameters: { layout: "centered" },
} satisfies Meta<typeof DefaultAvatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ThreeThemes: Story = {
  name: "닉네임마다 다른 그림 (낮 · 노을 · 밤바다)",
  args: { seed: "상호", size: 72 },
  render: () => (
    <div className="flex items-end gap-6 bg-gray-50 p-8">
      {["상호", "김민준", "SOOH LEE", "이후현", "여행자"].map((name) => (
        <div key={name} className="flex flex-col items-center gap-2">
          <DefaultAvatar seed={name} size={72} className="shadow-base ring-4 ring-white" />
          <span className="text-[12px] text-gray-500">{name}</span>
        </div>
      ))}
    </div>
  ),
};

export const Sizes: Story = {
  name: "쓰이는 크기 (헤더 28 · 댓글 32 · 마이페이지 72)",
  args: { seed: "상호", size: 72 },
  render: () => (
    <div className="flex items-end gap-4 bg-gray-50 p-8">
      {[28, 32, 40, 72].map((size) => (
        <DefaultAvatar key={size} seed="상호" size={size} className="ring-2 ring-white" />
      ))}
    </div>
  ),
};
