import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import LoginForm from "@/features/auth/LoginForm";
import LoginLayout from "@/features/auth/LoginLayout";
import ChatLogin from "./ChatLogin";
import PhotoLogin from "./PhotoLogin";
import SplitLogin from "./SplitLogin";

// 로그인 화면 시안 비교. 소셜 버튼(카카오·네이버·구글)은 네 가지 모두 같은 것을 쓴다.
const meta = {
  title: "Auth/로그인 화면 시안",
  parameters: {
    layout: "fullscreen",
    nextjs: { appDirectory: true, navigation: { pathname: "/login" } },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Current: Story = {
  name: "지금 · 가운데 카드",
  render: () => <LoginLayout loginForm={<LoginForm />} />,
};

export const Split: Story = {
  name: "A · 반반 (소개 + 로그인)",
  render: () => <SplitLogin />,
};

export const Photo: Story = {
  name: "B · 부산 사진 위에",
  render: () => <PhotoLogin />,
};

export const Chat: Story = {
  name: "C · 온나가 말을 거는",
  render: () => <ChatLogin />,
};
