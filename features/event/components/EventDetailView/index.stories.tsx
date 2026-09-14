import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import EventDetailView from "./index";
import { eventKeys } from "@/features/event/hooks/useEvents";

import type { BusanEvent } from "@/types/event";

// 스토리용 샘플 — 2026-09-14 운영 API(GET /events) 응답을 그대로 옮겼다. 캐시에 미리 넣어 네트워크 없이 그린다.
const SAMPLE_EVENTS: BusanEvent[] = [
  {
    "contentId": "4099532",
    "title": "2026 별바다부산 「나이트 캠크닉」",
    "eventStartDate": "2026-09-04",
    "eventEndDate": "2026-09-19",
    "mapX": 128.9666308,
    "mapY": 35.0460822,
    "tel": "051-626-8816",
    "addr1": "부산광역시 사하구 다대동 1674",
    "addr2": null,
    "firstImage": "https://tong.visitkorea.or.kr/cms/resource/41/4099541_image2_1.jpg",
    "firstImage2": "https://tong.visitkorea.or.kr/cms/resource/41/4099541_image3_1.jpg",
    "eventPlace": "다대포 해수욕장(해변공원)",
    "playTime": "17:00~22:00",
    "useTimeFestival": "[라이브공연]\n- 성인 13,000원\n- 아동 5,000원\n※ 일부 무료 객석 및 자세한 행사 요금은 문의 요망",
    "sponsor1": "사하구, 부산관광공사",
    "sponsor1Tel": "051-626-8816",
    "sponsor2": "부산관광공사",
    "sponsor2Tel": null,
    "ageLimit": "전 연령",
    "eventHomepage": null
  },
  {
    "contentId": "2786391",
    "title": "광안리 M(Marvelous) 드론 라이트쇼",
    "eventStartDate": "2026-01-01",
    "eventEndDate": "2026-12-31",
    "mapX": 129.1185199,
    "mapY": 35.1537728,
    "tel": "051-610-6518",
    "addr1": "부산광역시 수영구 광안해변로 219 (광안동)",
    "addr2": null,
    "firstImage": "https://tong.visitkorea.or.kr/cms/resource/12/3518612_image2_1.jpeg",
    "firstImage2": "https://tong.visitkorea.or.kr/cms/resource/12/3518612_image3_1.jpeg",
    "eventPlace": "광안리 해변 일원",
    "playTime": "- 하절기(3월~9월) 20:00, 22:00\n- 동절기(10월~2월) 19:00, 21:00",
    "useTimeFestival": "무료",
    "sponsor1": "부산광역시 수영구",
    "sponsor1Tel": "051-610-6518",
    "sponsor2": "부산광역시 수영구",
    "sponsor2Tel": null,
    "ageLimit": null,
    "eventHomepage": null
  },
  {
    "contentId": "4095478",
    "title": "부산브릿지마라톤",
    "eventStartDate": "2026-12-06",
    "eventEndDate": "2026-12-06",
    "mapX": 129.1360183,
    "mapY": 35.1690637,
    "tel": "070-4111-5620",
    "addr1": "부산광역시 해운대구 APEC로 55 (우동)",
    "addr2": null,
    "firstImage": "https://tong.visitkorea.or.kr/cms/resource/64/4095564_image2_1.png",
    "firstImage2": "https://tong.visitkorea.or.kr/cms/resource/64/4095564_image3_1.png",
    "eventPlace": "부산 벡스코 제1전시장",
    "playTime": "07:30 (종료 시간은 코스별로 상이함)",
    "useTimeFestival": "- 풀코스 80,000원\n- 10㎞ 60,000원",
    "sponsor1": "부산광역시, 대한육상연맹, KNN",
    "sponsor1Tel": "070-4111-5620",
    "sponsor2": "KNN, 부산육상연맹",
    "sponsor2Tel": null,
    "ageLimit": "만 18세 이상",
    "eventHomepage": null
  },
  {
    "contentId": "2991394",
    "title": "2026 부산나이트워크42K with dsec",
    "eventStartDate": "2026-08-29",
    "eventEndDate": "2026-08-30",
    "mapX": 129.1273173,
    "mapY": 35.1679082,
    "tel": "070-4705-2008",
    "addr1": "부산광역시 해운대구 수영강변대로 85 (우동)",
    "addr2": null,
    "firstImage": "https://tong.visitkorea.or.kr/cms/resource/37/4069137_image2_1.jpg",
    "firstImage2": "https://tong.visitkorea.or.kr/cms/resource/37/4069137_image3_1.jpg",
    "eventPlace": "APEC나루공원",
    "playTime": "16:00~07:00",
    "useTimeFestival": "- 8K 38,000원\n- 16K 42,000원\n- 24K 49,000원\n- 42K 59,000원",
    "sponsor1": "부산일보사, 어반씨앤에스",
    "sponsor1Tel": "070-4705-2008",
    "sponsor2": "㈜블렌트",
    "sponsor2Tel": "070-4705-2008",
    "ageLimit": null,
    "eventHomepage": null
  },
  {
    "contentId": "140799",
    "title": "부산국제록페스티벌",
    "eventStartDate": "2026-10-02",
    "eventEndDate": "2026-10-04",
    "mapX": 128.9681914,
    "mapY": 35.1728573,
    "tel": "051-713-5000",
    "addr1": "부산광역시 사상구 삼락동",
    "addr2": "29-50",
    "firstImage": "https://tong.visitkorea.or.kr/cms/resource/06/4040606_image2_1.jpg",
    "firstImage2": "https://tong.visitkorea.or.kr/cms/resource/06/4040606_image3_1.jpg",
    "eventPlace": "삼락생태공원",
    "playTime": "10:00~22:00",
    "useTimeFestival": "유료",
    "sponsor1": "부산광역시",
    "sponsor1Tel": "051-713-5000",
    "sponsor2": "부산축제조직위원회",
    "sponsor2Tel": null,
    "ageLimit": null,
    "eventHomepage": null
  },
  {
    "contentId": "229048",
    "title": "동래읍성역사축제",
    "eventStartDate": "2026-10-16",
    "eventEndDate": "2026-10-18",
    "mapX": 129.0905355,
    "mapY": 35.2120803,
    "tel": "051-550-4092",
    "addr1": "부산광역시 동래구 문화로 80 (명륜동)",
    "addr2": null,
    "firstImage": "https://tong.visitkorea.or.kr/cms/resource/43/3366443_image2_1.jpg",
    "firstImage2": "https://tong.visitkorea.or.kr/cms/resource/43/3366443_image3_1.jpg",
    "eventPlace": "동래읍성북문, 동래문화회관 일원",
    "playTime": "10:00~21:00",
    "useTimeFestival": "무료 (일부 프로그램 유료, 야외방탈출 10,000원, 체험 3,000~10,000원)",
    "sponsor1": "부산광역시 동래구",
    "sponsor1Tel": "051-550-4092",
    "sponsor2": "동래문화원, 동래읍성역사축제추진위원회",
    "sponsor2Tel": null,
    "ageLimit": null,
    "eventHomepage": null
  },
  {
    "contentId": "235076",
    "title": "부산불꽃축제",
    "eventStartDate": "2026-11-07",
    "eventEndDate": "2026-11-07",
    "mapX": 129.1185199,
    "mapY": 35.1537728,
    "tel": "051-713-5000",
    "addr1": "부산광역시 수영구 광안해변로 219 (광안동)",
    "addr2": null,
    "firstImage": "https://tong.visitkorea.or.kr/cms/resource/92/4107992_image2_1.jpg",
    "firstImage2": "https://tong.visitkorea.or.kr/cms/resource/92/4107992_image3_1.jpg",
    "eventPlace": "광안리해수욕장, 해운대, 이기대 일원",
    "playTime": "13:00 ~ 20:00",
    "useTimeFestival": "유료",
    "sponsor1": "부산광역시",
    "sponsor1Tel": "051-713-5000",
    "sponsor2": "(사)부산축제조직위원회",
    "sponsor2Tel": null,
    "ageLimit": null,
    "eventHomepage": null
  },
  {
    "contentId": "4033328",
    "title": "제14회 부산국제항만컨퍼런스",
    "eventStartDate": "2026-09-15",
    "eventEndDate": "2026-09-16",
    "mapX": 129.0493834,
    "mapY": 35.117513,
    "tel": "051-711-0069",
    "addr1": "부산광역시 동구 충장대로 206 (초량동)",
    "addr2": null,
    "firstImage": "https://tong.visitkorea.or.kr/cms/resource/79/4039679_image2_1.jpg",
    "firstImage2": "https://tong.visitkorea.or.kr/cms/resource/79/4039679_image3_1.jpg",
    "eventPlace": "부산항 국제전시컨벤션센터",
    "playTime": "※ 행사 시간 추후 결정 예정",
    "useTimeFestival": "무료",
    "sponsor1": "부산항만공사",
    "sponsor1Tel": "051-711-0069",
    "sponsor2": "부산항만공사",
    "sponsor2Tel": null,
    "ageLimit": null,
    "eventHomepage": null
  },
  {
    "contentId": "2558735",
    "title": "부산국제공연예술제(B.P.A.F)",
    "eventStartDate": "2026-09-18",
    "eventEndDate": "2026-09-20",
    "mapX": 129.08931,
    "mapY": 35.2296146,
    "tel": "051-715-6984",
    "addr1": "부산광역시 금정구 장전온천천로 48 (장전동)",
    "addr2": null,
    "firstImage": "https://tong.visitkorea.or.kr/cms/resource/65/4105565_image2_1.jpg",
    "firstImage2": "https://tong.visitkorea.or.kr/cms/resource/65/4105565_image3_1.jpg",
    "eventPlace": "부산 금정구 온천천 / 부산대학로 일원",
    "playTime": "13:00~20:00",
    "useTimeFestival": "무료",
    "sponsor1": "부산광역시 금정구",
    "sponsor1Tel": "051-715-6984",
    "sponsor2": "(재)금정문화재단",
    "sponsor2Tel": null,
    "ageLimit": null,
    "eventHomepage": null
  }
];

const meta = {
  title: "Event/EventDetailView",
  component: EventDetailView,
  parameters: {
    layout: "fullscreen",
    nextjs: { appDirectory: true },
  },
  decorators: [
    (Story) => {
      const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false, staleTime: Infinity } },
      });
      queryClient.setQueryData(eventKeys.list(), SAMPLE_EVENTS);
      return (
        <QueryClientProvider client={queryClient}>
          <Story />
        </QueryClientProvider>
      );
    },
  ],
} satisfies Meta<typeof EventDetailView>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 진행 중 · 요금표 · 주최/주관 */
export const Ongoing: Story = { args: { contentId: "4099532" } };

/** 1년 내내 여는 상설 행사 */
export const LongRunning: Story = { args: { contentId: "2786391" } };

/** 곧 시작하는 행사 */
export const Upcoming: Story = { args: { contentId: "4095478" } };

/** 종료된 행사 */
export const Ended: Story = { args: { contentId: "2991394" } };
