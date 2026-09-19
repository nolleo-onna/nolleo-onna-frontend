import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import PublicCourseList from "./index";
import type { PopularCourse } from "@/types/course";

// 운영 API(GET /api/v1/courses/popular)에서 받아 둔 실제 공개 코스 일부.
// 개발 API에 닿지 않는 환경에서도 정렬·격자·더 보기를 볼 수 있게 fetch를 흉내 낸다.
const IMG = "https://tong.visitkorea.or.kr/cms/resource/";

type Row = [title: string, author: string, view: number, like: number, cost: number, created: string, image: string, stops: string[]];

const ROWS: Row[] = [
  ["전포와 서면의 낭만 산책", "상호", 6, 0, 52000, "2026-09-14", "33/3496933_image2_1.jpg", ["서면1번가", "더스타뷔페", "전포 삼거리", "스콜", "사미헌 신관", "부산시민공원"]],
  ["센텀 중심 코스", "SOOH LEE", 2, 0, 38000, "2026-09-17", "01/3493601_image2_1.jpg", ["뮤지엄 원", "부산엑스더스카이", "올림픽동산", "센텀시티", "APEC나루공원", "수영강 산책로"]],
  ["사상과 서구의 힐링 산책", "상호", 2, 0, 24000, "2026-09-15", "02/3492402_image2_1.jpg", ["닥밭골 벽화마을", "천마산 조각공원", "비석문화마을", "송도키친", "부산도서관", "사상근린공원"]],
  ["부산 국제 공연 예술제 근처 동선 코스", "김민준", 1, 0, 45000, "2026-09-18", "60/3496960_image2_1.jpg", ["전포카페거리", "부산시민공원", "서면먹자골목", "송상현광장", "부산 어린이대공원", "스콜"]],
  ["해운대 감성 힐링 코스", "상호", 1, 1, 61000, "2026-09-15", "16/3350316_image2_1.jpg", ["부산엑스더스카이", "부산 올림픽동산", "뮤지엄 원", "해운대 해변열차", "청사포", "달맞이길"]],
  ["광안리 미식과 낭만 여행", "김민준", 1, 0, 47000, "2026-09-11", "45/3311245_image2_1.jpg", ["광안리해수욕장", "민락수변공원", "윤희횟집", "광안리해변 테마거리", "금련산", "망미단길"]],
  ["광안리 중심 코스", "이후현", 0, 0, 33000, "2026-09-16", "42/3071042_image2_1.JPG", ["광안리해변 테마거리", "밀레니엄횟집", "민락해변공원", "콩셉트", "수영민속예술관", "포디움다이브"]],
  ["부산 원도심 감성 투어", "김민준", 0, 0, 29000, "2026-09-15", "40/3494840_image2_1.jpg", ["부산타워", "BIFF 광장", "40계단문화관", "이재모피자 본점", "우리글방 북카페", "국제시장"]],
  ["광안리 힐링 미식 여행", "김민준", 0, 0, 36000, "2026-09-15", "66/3498366_image2_1.jpg", ["민락수변공원", "장덕풍천장어 광안본점", "비쇼쿠", "광안리해수욕장"]],
  ["연제구 미식과 야경 투어", "상호", 0, 0, 41000, "2026-09-14", "85/3060985_image2_1.JPG", ["사직야구장", "부산해양자연사박물관", "동신참치", "1934 기차 동래역", "온천천 카페거리", "대관원"]],
  ["광안리 미식과 낭만 여행", "상호", 0, 0, 39000, "2026-09-11", "62/3014362_image2_1.JPG", ["민락해변공원", "약콩밀면", "광안시장박고지김밥", "광안리해수욕장", "금련산", "망미단길"]],
];

const COURSES: PopularCourse[] = ROWS.map(([title, author, viewCount, likeCount, totalCost, createdAt, image, spotTitles], i) => ({
  shareToken: `story-token-${i}`,
  title,
  description: null,
  totalCost,
  spotTitles,
  thumbnailImageUrl: IMG + image,
  authorNickname: author,
  authorProfileImageUrl: null,
  viewCount,
  likeCount,
  createdAt: `${createdAt}T12:00:00`,
}));

// 스토리를 옮겨 다녀도 원본 fetch를 한 번만 붙잡아 둔다 (계속 감싸면 앞 스토리 응답이 먼저 걸린다)
let originalFetch: typeof window.fetch | null = null;

function mockFetch(courses: PopularCourse[]) {
  originalFetch ??= window.fetch.bind(window);
  const original = originalFetch;
  window.fetch = async (input, init) => {
    const raw = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
    const url = new URL(raw, window.location.href);
    if (url.pathname.endsWith("/api/v1/courses/popular")) {
      const page = Number(url.searchParams.get("page") ?? 0);
      const size = Number(url.searchParams.get("size") ?? 12);
      const slice = courses.slice(page * size, (page + 1) * size);
      return new Response(JSON.stringify({ status: 200, message: "ok", data: slice }), {
        headers: { "Content-Type": "application/json" },
      });
    }
    return original(input, init);
  };
}

const meta = {
  title: "Course/공유된 코스 전체보기",
  parameters: { layout: "fullscreen", nextjs: { appDirectory: true, navigation: { pathname: "/course/shared" } } },
  decorators: [
    (Story) => (
      // 스토리마다 새 QueryClient — 앞 스토리의 목록이 남아 보이지 않게
      <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
        <div className="min-h-screen bg-white">
          <div className="mx-auto w-full max-w-[1280px] px-5 py-10 md:px-10 lg:px-20">
            <Story />
          </div>
        </div>
      </QueryClientProvider>
    ),
  ],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: "공개 코스 11개",
  render: () => <PublicCourseList />,
  loaders: [async () => mockFetch(COURSES)],
};

export const Empty: Story = {
  name: "아직 공개된 코스가 없을 때",
  render: () => <PublicCourseList />,
  loaders: [async () => mockFetch([])],
};
