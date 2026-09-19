import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import LoginForm from "@/features/auth/LoginForm";
import LoginLayout from "@/features/auth/LoginLayout";
import ChatLogin from "./ChatLogin";
import MosaicLogin from "./MosaicLogin";
import PhotoLogin from "./PhotoLogin";
import PhotoSplitLogin from "./PhotoSplitLogin";
import SplitLogin from "./SplitLogin";
import TicketLogin from "./TicketLogin";
import FloatingSpotLogin from "./FloatingSpotLogin";
import TypeLogin from "./TypeLogin";

// 로그인 화면 시안 비교. 소셜 버튼은 모두 같은 것을 쓴다.
// 관광공사 사진은 940×627이 최대라, 화면 전체로 늘리면 흐리다 — B-1·B-2는 사진을 제 크기로 쓰는 안이다.
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
  name: "B · 부산 사진 위에 (사진이 늘어나 흐림)",
  render: () => <PhotoLogin />,
};

export const Mosaic: Story = {
  name: "B-1 · 사진 모자이크 (아홉 장 격자)",
  render: () => <MosaicLogin />,
};

export const PhotoSplit: Story = {
  name: "B-2 · 사진 반반 (한쪽만 사진)",
  render: () => <PhotoSplitLogin />,
};

export const Chat: Story = {
  name: "C · 온나가 말을 거는",
  render: () => <ChatLogin />,
};

export const Ticket: Story = {
  name: "D · 부산행 탑승권",
  render: () => <TicketLogin />,
};

export const FloatingSpot: Story = {
  name: "E · 떠다니는 스팟 카드",
  render: () => <FloatingSpotLogin />,
};

export const Type: Story = {
  name: "F · 큰 글씨 (사진 없음)",
  render: () => <TypeLogin />,
};
