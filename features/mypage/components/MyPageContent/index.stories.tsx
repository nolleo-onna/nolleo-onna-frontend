import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import MyPageContent from "./index";
import { myCoursesKeys } from "@/features/course/hooks/useMyCourses";
import { favoriteStatsKey } from "@/features/mypage/hooks/useFavoriteStats";
import { favoriteKeys } from "@/features/spot/hooks/useFavorites";
import { ME_QUERY_KEY } from "@/hooks/useMe";

import type { User } from "@/types/auth";
import type { MyCourseSummary } from "@/types/course";
import type { FavoritePlace } from "@/types/favorite";
import type { FavoriteStats } from "@/libs/api/users";

// 마이페이지는 로그인해야 열려서, 캐시에 샘플 사용자·코스·찜을 넣어 화면을 확인한다
const USER: User = { userId: 1, email: "traveler@nolleo-onna.site", nickname: "상호", role: "USER" };

const COURSES: MyCourseSummary[] = [
  { id: 1, pairId: "a1", title: "전포와 서면의 낭만 산책", description: "", totalCost: 52000, isPublic: true, likeCount: 3, spotTitles: ["서면1번가", "더스타뷔페", "전포 삼거리", "스콜", "사미헌 신관", "부산시민공원"] },
  { id: 2, pairId: "a2", title: "광안리 미식과 낭만 산책", description: "", totalCost: 46500, isPublic: false, likeCount: 0, spotTitles: ["자연활어 수정궁", "비쇼쿠", "부산광안대교", "민락수변공원"] },
  { id: 3, pairId: "a3", title: "영도 바다 산책", description: "", totalCost: 0, isPublic: false, likeCount: 0, spotTitles: ["흰여울문화마을", "태종대"] },
];

const FAVORITES: FavoritePlace[] = [
  { mapPlaceId: 1, name: "뮤지엄 원", placeType: "SPOT", originalId: null, district: "해운대구", category: null, imageUrl: "https://tong.visitkorea.or.kr/cms/resource/95/3506195_image2_1.jpg" },
  { mapPlaceId: 2, name: "유엔평화기념관", placeType: "SPOT", originalId: null, district: "남구", category: null, imageUrl: null },
  { mapPlaceId: 3, name: "오시리아 해안산책로", placeType: "SPOT", originalId: null, district: "기장군", category: null, imageUrl: "https://tong.visitkorea.or.kr/cms/resource/74/3495474_image2_1.jpg" },
  { mapPlaceId: 4, name: "흰여울문화마을", placeType: "SPOT", originalId: null, district: "영도구", category: null, imageUrl: "https://tong.visitkorea.or.kr/cms/resource/74/3495874_image2_1.jpg" },
];

const STATS: FavoriteStats = { period: "MONTH", count: 1, message: "이번 달 1개 찜했어요!" };

const meta = {
  title: "MyPage/MyPageContent",
  component: MyPageContent,
  parameters: { layout: "fullscreen", nextjs: { appDirectory: true } },
  decorators: [
    (Story) => {
      const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false, staleTime: Infinity } },
      });
      queryClient.setQueryData(ME_QUERY_KEY, USER);
      queryClient.setQueryData(myCoursesKeys.all, COURSES);
      queryClient.setQueryData(favoriteKeys.list(), FAVORITES);
      queryClient.setQueryData(favoriteStatsKey, STATS);
      try {
        localStorage.setItem("hankkut:bookmarks", JSON.stringify([1, 10]));
      } catch {
        // 스토리 환경에서 저장소를 못 쓰면 저장한 한끗은 빈 상태로 보인다
      }
      return (
        <QueryClientProvider client={queryClient}>
          <div className="min-h-screen bg-gray-50">
            <Story />
          </div>
        </QueryClientProvider>
      );
    },
  ],
} satisfies Meta<typeof MyPageContent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
