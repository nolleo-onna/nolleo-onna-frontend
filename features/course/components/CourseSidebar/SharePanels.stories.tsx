import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { HomeListingCard, LinkShareConfirm } from "./SharePanels";
import ShareButton from "./ShareButton";

import type { CourseShareInfo } from "@/types/course";

const PRIVATE: CourseShareInfo = { isPublic: false, shareToken: null, viewCount: 0, likeCount: 0 };
const PUBLIC: CourseShareInfo = { isPublic: true, shareToken: "abc123", viewCount: 128, likeCount: 9 };

const noop = () => {};

// 코스 결과 페이지는 로그인해야 열려서, 사이드바의 링크 공유 · 홈 올리기 부분만 모아 확인한다
function SidebarFrame({ children }: { children: React.ReactNode }) {
  return <div className="w-[340px] bg-white p-5">{children}</div>;
}

const meta = {
  title: "Course/SharePanels",
  component: HomeListingCard,
  args: { share: PRIVATE, isPending: false, onList: noop, onUnlist: noop },
  parameters: { layout: "centered" },
} satisfies Meta<typeof HomeListingCard>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 비공개 코스 — 헤더의 링크 공유와 따로 "홈 인기 코스에 올리기"가 보인다 */
export const PrivateCourse: Story = {
  render: (args) => (
    <SidebarFrame>
      <div className="mb-3 flex justify-end">
        <ShareButton status="idle" onClick={noop} />
      </div>
      <HomeListingCard {...args} />
    </SidebarFrame>
  ),
};

/** 비공개 코스에서 링크 공유를 눌렀을 때 — 홈에도 올라간다는 확인이 먼저 펼쳐진다 */
export const LinkShareConfirmOpen: Story = {
  render: (args) => (
    <SidebarFrame>
      <div className="mb-3 flex justify-end">
        <ShareButton status="confirming" onClick={noop} />
      </div>
      <LinkShareConfirm open isPublishing={false} onConfirm={noop} onCancel={noop} />
      <HomeListingCard {...args} />
    </SidebarFrame>
  ),
};

/** 홈에 올라간 코스 — 조회수·좋아요와 내리기 */
export const ListedOnHome: Story = {
  args: { share: PUBLIC },
  render: (args) => (
    <SidebarFrame>
      <div className="mb-3 flex justify-end">
        <ShareButton status="copied" onClick={noop} />
      </div>
      <HomeListingCard {...args} />
    </SidebarFrame>
  ),
};
