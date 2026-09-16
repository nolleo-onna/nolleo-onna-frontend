import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { buildCourseNotices, saveCourseNotices } from "@/features/course/utils/courseNotices";
import CourseNoticeToasts from "./index";

import type { CourseGenerateApplied, CourseGenerateUnmatched } from "@/types/course";

// 실제 흐름과 같게 — 검색바가 저장해둔 안내를 결과 화면이 pairId로 꺼내 보여준다
function seed(
  pairId: string,
  requestedArea: string,
  applied: CourseGenerateApplied,
  unmatched: CourseGenerateUnmatched,
) {
  sessionStorage.removeItem("course:notices");
  saveCourseNotices(pairId, buildCourseNotices({ requestedArea, applied, unmatched }));
}

const base: CourseGenerateApplied = {
  startArea: "광안리",
  budget: { tier: "UNDER_30K", filterRelaxed: false },
  includeSpots: [],
  festival: null,
};

const none: CourseGenerateUnmatched = { includeSpots: [], festival: null };

const meta = {
  title: "Course/CourseNoticeToasts",
  component: CourseNoticeToasts,
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <div className="h-screen bg-gradient-to-br from-ocean-50 to-gray-100 pt-4">
        <p className="pt-4 text-center text-sm text-gray-400">코스 결과 화면 (배경)</p>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof CourseNoticeToasts>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 축제를 찾아 지역이 축제 위치로 바뀐 경우 */
export const FestivalMovedArea: Story = {
  name: "축제 위치로 지역이 바뀜",
  args: { pairId: "pair-1" },
  render: () => {
    seed(
      "pair-1",
      "광안리",
      {
        ...base,
        startArea: "중구",
        festival: { name: "부산불꽃축제", matchedTitle: "제20회 부산불꽃축제", period: "11.1~11.1" },
      },
      none,
    );
    return <CourseNoticeToasts pairId="pair-1" />;
  },
};

/** 못 찾은 장소·축제 + 예산 상한을 푼 경우까지 한꺼번에 */
export const AllNotices: Story = {
  name: "안내 4종 모두",
  args: { pairId: "pair-2" },
  render: () => {
    seed(
      "pair-2",
      "광안리",
      { ...base, startArea: "중구", budget: { tier: "UNDER_10K", filterRelaxed: true } },
      { includeSpots: ["동백섬 바다", "없는가게"], festival: "없는축제" },
    );
    return <CourseNoticeToasts pairId="pair-2" />;
  },
};
