import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { HomeListingCard } from "./SharePanels";
import ShareButton from "./ShareButton";
import { buildCourseShareText } from "@/features/course/utils/courseShareText";

import type { CourseShareInfo } from "@/types/course";

const PRIVATE: CourseShareInfo = { isPublic: false, shareToken: null, viewCount: 0, likeCount: 0 };
const PUBLIC: CourseShareInfo = { isPublic: true, shareToken: "abc123", viewCount: 128, likeCount: 9 };

const SAMPLE_PLACES = [
  { name: "흰여울문화마을", lat: 35.0781, lng: 129.0452, expectedCost: 0, distanceFromPrevM: 0 },
  { name: "영도 카페거리", lat: 35.0869, lng: 129.0443, expectedCost: 7000, distanceFromPrevM: 1100 },
  { name: "태종대", lat: 35.0531, lng: 129.0874, expectedCost: 15000, distanceFromPrevM: 4200 },
];

const noop = () => {};

// 코스 결과 페이지는 로그인해야 열려서, 사이드바의 공유 · 홈 올리기 부분만 모아 확인한다
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

/** 비공개 코스 — 헤더 "공유"는 내용만 보내고, 홈 올리기는 카드에서 따로 */
export const PrivateCourse: Story = {
  render: (args) => (
    <SidebarFrame>
      <div className="mb-3 flex justify-end">
        <ShareButton copied={false} onClick={noop} />
      </div>
      <HomeListingCard {...args} />
    </SidebarFrame>
  ),
};

/** 홈에 올라간 코스 — 조회수·좋아요, 사이트 링크 복사, 홈에서 내리기 */
export const ListedOnHome: Story = {
  args: { share: PUBLIC },
  render: (args) => (
    <SidebarFrame>
      <div className="mb-3 flex justify-end">
        <ShareButton copied onClick={noop} />
      </div>
      <HomeListingCard {...args} />
    </SidebarFrame>
  ),
};

/** "공유"를 누르면 보내지는 글 — 비공개 코스(사이트 링크 없음) */
export const SharedTextPreview: Story = {
  render: () => (
    <pre className="w-[360px] whitespace-pre-wrap rounded-2xl bg-white p-5 text-[12px] leading-relaxed text-gray-700 ring-1 ring-gray-100">
      {buildCourseShareText({ title: "영도 바다 산책", description: "조용한 오후 코스", places: SAMPLE_PLACES })}
    </pre>
  ),
};
