import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import CourseSidebar from "./index";
import { MOCK_COURSE } from "@/features/course/data/mockCourse";

import type { CourseShareInfo } from "@/types/course";

const SHARE: CourseShareInfo = { isPublic: false, shareToken: null, viewCount: 0, likeCount: 0 };
const noop = () => {};

// 코스 결과 페이지는 로그인해야 열려서, 사이드바만 목업 코스로 확인한다 (보기 · 편집)
const meta = {
  title: "Course/CourseSidebar",
  component: CourseSidebar,
  args: {
    course: MOCK_COURSE,
    selectedDay: 1,
    selectedPlaceId: MOCK_COURSE.days[0].places[1].id,
    budget: 50000,
    share: SHARE,
    onPublish: async () => null,
    onUnpublish: noop,
    onStartEdit: noop,
    onSelectDay: noop,
    onSelectPlace: noop,
  },
  parameters: { layout: "fullscreen", nextjs: { appDirectory: true } },
  decorators: [
    (Story) => (
      <div className="flex h-screen bg-gray-50">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof CourseSidebar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Editing: Story = {
  args: {
    isEditing: true,
    isDirty: true,
    onChangeTitle: noop,
    onChangeDescription: noop,
    onSaveEdit: noop,
    onCancelEdit: noop,
    onMovePlace: noop,
    onReorderPlaces: noop,
    onRemovePlace: noop,
  },
};

// 오른쪽 패널에서 장소를 추가한 직후 — 마지막 카드가 밀려 올라오며 잠깐 강조된다
export const JustAdded: Story = {
  name: "편집 · 방금 추가된 장소 강조",
  args: {
    ...Editing.args,
    justAddedPlaceId: MOCK_COURSE.days[0].places.at(-1)?.id ?? null,
    selectedPlaceId: null,
  },
};
