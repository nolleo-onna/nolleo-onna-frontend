import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { eventKeys } from "@/features/event/hooks/useEvents";
import EventSection from "./index";

import type { BusanEvent } from "@/types/event";

const T = "https://tong.visitkorea.or.kr/cms/resource/";

const event = (contentId: string, title: string, addr1: string, image: string): BusanEvent => ({
  contentId,
  title,
  eventStartDate: "2026-09-01",
  eventEndDate: "2026-12-31",
  mapX: 129.0,
  mapY: 35.1,
  tel: null,
  addr1,
  addr2: null,
  firstImage: image,
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
});

// 포스터마다 한끗 연결이 다르게 나오도록 골랐다 — 한끗 글 / 동네 페이지 / 행사 상세
const EVENTS: BusanEvent[] = [
  event("235076", "부산불꽃축제 (한끗 글 있음)", "부산광역시 수영구 광안해변로 219", `${T}11/3413711_image2_1.jpg`),
  event("9000001", "영도 행사 (동네 페이지)", "부산광역시 영도구 해양로 301", `${T}74/3495874_image2_1.jpg`),
  event("9000002", "사하 행사 (동네 페이지)", "부산광역시 사하구 다대동 1674", `${T}50/2732750_image2_1.jpg`),
  event("9000003", "금정 행사 (행사 상세)", "부산광역시 금정구 부산대학로 63", `${T}30/3476830_image2_1.jpg`),
];

const meta = {
  title: "Home/EventSection",
  component: EventSection,
  parameters: { layout: "fullscreen", nextjs: { appDirectory: true } },
  decorators: [
    (Story) => {
      const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, staleTime: Infinity } } });
      queryClient.setQueryData(eventKeys.list(), EVENTS);
      return (
        <QueryClientProvider client={queryClient}>
          <Story />
        </QueryClientProvider>
      );
    },
  ],
} satisfies Meta<typeof EventSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
