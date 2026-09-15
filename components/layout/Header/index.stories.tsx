import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { HeaderView } from "./index";

const USER = { nickname: "상호", email: "traveler@nolleo-onna.site" };

// 로그인 상태는 useAuth 대신 props로 넣는다. 스크롤하면 캡슐이 더 불투명해지는지 보려고 긴 배경을 깔았다.
const meta = {
  title: "Layout/Header",
  component: HeaderView,
  args: { user: null, isLoading: false, isLoggingOut: false, onLogout: () => {} },
  parameters: {
    layout: "fullscreen",
    nextjs: { appDirectory: true, navigation: { pathname: "/" } },
  },
  decorators: [
    (Story) => (
      <div className="min-h-[180vh] bg-gray-50">
        <div className="h-[440px] rounded-b-[48px] bg-gradient-to-br from-ocean-300 via-ocean-500 to-navy-600" />
        <Story />
        <div className="mx-auto max-w-[1280px] px-5 pt-10 text-sm text-gray-500 md:px-10 lg:px-20">
          아래로 스크롤하면 헤더 캡슐이 더 불투명해지고 그림자가 짙어져요.
        </div>
      </div>
    ),
  ],
} satisfies Meta<typeof HeaderView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const LoggedOut: Story = {};

export const LoggedIn: Story = {
  args: { user: USER },
};

export const Loading: Story = {
  args: { isLoading: true },
};

export const OnSpotPage: Story = {
  args: { user: USER },
  parameters: { nextjs: { appDirectory: true, navigation: { pathname: "/spot" } } },
};

/** 하위 페이지에서도 코스 탭이 켜진다 */
export const OnCourseResult: Story = {
  args: { user: USER },
  parameters: { nextjs: { appDirectory: true, navigation: { pathname: "/course/result" } } },
};
