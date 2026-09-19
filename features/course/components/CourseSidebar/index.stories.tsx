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

// 상호가 긴 음식점 — 한 줄에서 잘리지 않고 두 줄까지 보이는지
export const LongPlaceNames: Story = {
  name: "긴 상호 (두 줄까지)",
  args: {
    course: {
      ...MOCK_COURSE,
      days: [
        {
          ...MOCK_COURSE.days[0],
          places: MOCK_COURSE.days[0].places.map((place, i) =>
            i === 2
              ? { ...place, name: "장덕풍천장어 광안리해수욕장 본점", category: "음식점", expectedCost: 32000 }
              : i === 3
                ? { ...place, name: "양가손만두 부전시장 본점 해운대 직영점", category: "음식점", expectedCost: 12000 }
                : place,
          ),
        },
        ...MOCK_COURSE.days.slice(1),
      ],
    },
    selectedPlaceId: null,
  },
};

// 음식점 카드 — 분류·가격·혼잡도 배지가 한 줄에 다 들어가는지 (좁아서 글자가 세로로 쌓이던 자리)
export const FoodPlaceRow: Story = {
  name: "음식점 · 가격 · 혼잡도 한 줄",
  args: {
    course: {
      ...MOCK_COURSE,
      days: [
        {
          ...MOCK_COURSE.days[0],
          places: MOCK_COURSE.days[0].places.map((place, i) =>
            i < 2
              ? { ...place, name: i === 0 ? "광안리 대교밀면" : "수변최고돼지국밥", category: "음식점 · 카페", expectedCost: i === 0 ? 7000 : 8700 }
              : place,
          ),
        },
        ...MOCK_COURSE.days.slice(1),
      ],
    },
    selectedPlaceId: null,
    congestionByPlaceId: new Map(
      MOCK_COURSE.days[0].places.map((place) => [
        place.id,
        { level: "매우혼잡" as const, rate: 91, source: "district" as const, district: "수영구" },
      ]),
    ),
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
