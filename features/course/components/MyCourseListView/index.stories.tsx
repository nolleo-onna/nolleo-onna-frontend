import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import MyCourseListView from "./index";
import { myCoursesKeys } from "@/features/course/hooks/useMyCourses";

import type { MyCourseSummary } from "@/types/course";

// 내 코스 목록은 로그인해야 열려서, 캐시에 샘플을 넣어 화면을 확인한다
const SAMPLE_COURSES: MyCourseSummary[] = [
  {
    id: 1,
    pairId: "a1",
    title: "전포와 서면의 낭만 산책",
    description: "서면의 맛집과 전포의 감성을 모두 즐기는 알찬 부산 도심 여행 코스입니다.",
    totalCost: 52000,
    isPublic: true,
    likeCount: 3,
    spotTitles: ["서면1번가", "더스타뷔페", "전포 삼거리", "스콜", "사미헌 신관", "부산시민공원"],
  },
  {
    id: 2,
    pairId: "a2",
    title: "광안리 미식과 낭만 산책",
    description: "광안리의 신선한 회와 야경을 즐기고 영화의전당까지 둘러보는 알찬 코스입니다.",
    totalCost: 46500,
    isPublic: false,
    likeCount: 0,
    spotTitles: ["자연활어 수정궁", "비쇼쿠", "부산광안대교", "민락수변공원"],
  },
  {
    id: 3,
    pairId: "a3",
    title: "영도 바다 산책",
    description: "",
    totalCost: 0,
    isPublic: false,
    likeCount: 0,
    spotTitles: ["흰여울문화마을", "태종대"],
  },
];

const meta = {
  title: "Course/MyCourseListView",
  component: MyCourseListView,
  parameters: { layout: "fullscreen", nextjs: { appDirectory: true, navigation: { pathname: "/course", query: {} } } },
  decorators: [
    (Story) => {
      const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false, staleTime: Infinity } },
      });
      queryClient.setQueryData(myCoursesKeys.all, SAMPLE_COURSES);
      return (
        <QueryClientProvider client={queryClient}>
          <div className="min-h-screen bg-gray-50">
            <Story />
          </div>
        </QueryClientProvider>
      );
    },
  ],
} satisfies Meta<typeof MyCourseListView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
