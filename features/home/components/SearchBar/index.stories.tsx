import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import AIChatProvider from "@/providers/AIChatProvider";
import { courseSuggestKeys } from "@/features/home/hooks/useCourseFormSuggestions";
import { eventKeys } from "@/features/event/hooks/useEvents";
import SearchBar from "./index";

import type { BusanEvent } from "@/types/event";
import type { MapPlace, MapPlacePage } from "@/types/map";

// 후보 목록은 캐시에 직접 넣는다 — 스토리북에 백엔드를 붙이지 않고도 검색 결과를 볼 수 있다.
const place = (originalId: string, name: string, district: string): MapPlace => ({
  id: Number(originalId),
  placeType: "FOOD",
  originalId,
  name,
  district,
  category: "FD",
  longitude: 129.0,
  latitude: 35.1,
  imageUrl: null,
  minPrice: 12000,
  free: false,
  avgRating: 4.5,
  reviewCount: 120,
});

const placePage = (content: MapPlace[]): MapPlacePage => ({
  content,
  totalElements: content.length,
  totalPages: 1,
  last: true,
  numberOfElements: content.length,
});

const event = (contentId: string, title: string, start: string, end: string): BusanEvent =>
  ({
    contentId,
    title,
    eventStartDate: start,
    eventEndDate: end,
    mapX: 129.0,
    mapY: 35.1,
    tel: null,
    addr1: null,
    addr2: null,
    firstImage: null,
    firstImage2: null,
    eventPlace: null,
    playTime: null,
    useTimeFestival: null,
    sponsor1: null,
    sponsor1Tel: null,
    sponsor2: null,
    sponsor2Tel: null,
    ageLimit: null,
    eventHomepage: null,
  }) satisfies BusanEvent;

const FESTIVALS: BusanEvent[] = [
  event("1", "제20회 부산불꽃축제", "2026-11-01", "2026-11-01"),
  event("2", "광안리 M 드론라이트쇼", "2026-09-05", "2026-12-27"),
  event("3", "부산국제영화제", "2026-10-01", "2026-10-10"),
];

const SPOTS: MapPlace[] = [
  place("111", "이재모피자 본점", "중구"),
  place("112", "이재모피자 서면점", "부산진구"),
];

function withProviders(seed?: (qc: QueryClient) => void) {
  return function Decorator(Story: () => React.ReactElement) {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    queryClient.setQueryData(eventKeys.list(), FESTIVALS);
    seed?.(queryClient);
    return (
      <QueryClientProvider client={queryClient}>
        <AIChatProvider>
          <div className="min-h-screen bg-gray-50 p-6">
            <Story />
          </div>
        </AIChatProvider>
      </QueryClientProvider>
    );
  };
}

const meta = {
  title: "Home/SearchBar",
  component: SearchBar,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    nextjs: { appDirectory: true, navigation: { pathname: "/" } },
  },
  decorators: [withProviders()],
} satisfies Meta<typeof SearchBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { name: "기본 — 지역·예산 필수, 행사·꼭 갈 곳 선택" };

/** 장소 이름을 치면 후보가 뜬다. "이재모"까지 입력된 상태를 캐시로 만들어둔 스토리 */
export const SpotSuggestions: Story = {
  name: "꼭 갈 곳 검색 결과",
  decorators: [
    withProviders((qc) => {
      qc.setQueryData(courseSuggestKeys.spots("이재모"), placePage(SPOTS));
    }),
  ],
};
