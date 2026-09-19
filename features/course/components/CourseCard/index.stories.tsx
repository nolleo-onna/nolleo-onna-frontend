import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import RouteItineraryCard from "@/features/home/components/PopularCourseSection/RouteItineraryCard";
import CourseCardMagazine from "./CourseCardMagazine";
import CourseCardRouteLine from "./CourseCardRouteLine";
import CourseCardTicket from "./CourseCardTicket";
import type { CourseCardProps } from "./types";

// 운영 API에서 받아 둔 실제 공개 코스. 제목 길이·장소 수·비용이 제각각인 것만 골랐다.
const IMG = "https://tong.visitkorea.or.kr/cms/resource/";

const SAMPLES: CourseCardProps[] = [
  {
    rank: 1,
    title: "전포와 서면의 낭만 산책",
    imageSrc: `${IMG}33/3496933_image2_1.jpg`,
    authorNickname: "상호",
    viewCount: 6,
    likeCount: 0,
    totalCost: 52000,
    stops: ["서면1번가", "더스타뷔페", "전포 삼거리", "스콜", "사미헌 신관", "부산시민공원"],
  },
  {
    rank: 2,
    title: "부산 국제 공연 예술제 근처 동선 코스",
    imageSrc: `${IMG}60/3496960_image2_1.jpg`,
    authorNickname: "김민준",
    viewCount: 1,
    likeCount: 3,
    totalCost: 45000,
    stops: ["전포카페거리", "부산시민공원", "서면먹자골목", "송상현광장", "부산 어린이대공원"],
  },
  {
    rank: 3,
    title: "광안리 힐링 미식 여행",
    imageSrc: `${IMG}66/3498366_image2_1.jpg`,
    authorNickname: "김민준",
    viewCount: 0,
    likeCount: 0,
    totalCost: null,
    stops: ["민락수변공원", "장덕풍천장어 광안본점", "비쇼쿠", "광안리해수욕장"],
  },
];

function Grid({ render }: { render: (props: CourseCardProps) => React.ReactNode }) {
  return (
    <div className="bg-gray-50 p-6 md:p-10">
      <div className="mx-auto grid max-w-[1100px] gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SAMPLES.map((sample) => (
          <div key={sample.title} className="flex">
            {render(sample)}
          </div>
        ))}
      </div>
    </div>
  );
}

// 공유된 코스 전체보기·홈에서 쓰는 코스 카드 시안 비교.
const meta = {
  title: "Course/코스 카드 시안",
  parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Current: Story = {
  name: "지금 · 비교용",
  render: () => <Grid render={(p) => <RouteItineraryCard {...p} />} />,
};

export const Magazine: Story = {
  name: "A · 매거진 (사진 가득)",
  render: () => <Grid render={(p) => <CourseCardMagazine {...p} />} />,
};

export const Ticket: Story = {
  name: "B · 코스 티켓 (점선 · 비용 강조)",
  render: () => <Grid render={(p) => <CourseCardTicket {...p} />} />,
};

export const RouteLine: Story = {
  name: "C · 노선도 (가로 동선)",
  render: () => <Grid render={(p) => <CourseCardRouteLine {...p} />} />,
};
