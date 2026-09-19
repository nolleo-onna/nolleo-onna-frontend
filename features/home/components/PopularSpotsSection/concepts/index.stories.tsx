import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import SpotTicketCard from "../SpotTicketCard";
import SpotOverlayCard from "./SpotOverlayCard";
import SpotPostcardCard from "./SpotPostcardCard";
import SpotRankCard from "./SpotRankCard";
import type { SpotCardProps } from "./types";

// 운영 API(장소 목록)에서 받아 둔 실제 스팟 — 이름 길이·무료 여부가 섞이게 골랐다
const IMG = "https://tong.visitkorea.or.kr/cms/resource/";

const SAMPLES: SpotCardProps[] = [
  { index: 0, name: "광안리해수욕장", location: "수영구", rating: 4.8, price: null, imageSrc: `${IMG}45/3311245_image2_1.jpg` },
  { index: 1, name: "부산엑스더스카이", location: "해운대구", rating: 4.6, price: 27000, imageSrc: `${IMG}16/3350316_image2_1.jpg` },
  { index: 2, name: "동래온천길(온천천 카페거리)", location: "동래구", rating: 4.3, price: null, imageSrc: `${IMG}33/2822333_image2_1.png` },
  { index: 3, name: "뮤지엄 원", location: "해운대구", rating: 4.5, price: 15000, imageSrc: `${IMG}01/3493601_image2_1.jpg` },
];

function Grid({ render }: { render: (props: SpotCardProps) => React.ReactNode }) {
  return (
    <div className="bg-gray-50 p-6 md:p-10">
      <div className="mx-auto grid max-w-[1100px] grid-cols-2 gap-4 lg:grid-cols-4">
        {SAMPLES.map((sample) => (
          <div key={sample.name}>{render(sample)}</div>
        ))}
      </div>
    </div>
  );
}

// 홈 "인기 부산 스팟" 카드 시안 비교. 지금 카드의 "BUSAN" 배지가 별로라는 피드백으로 만들었다.
const meta = {
  title: "Home/인기 스팟 카드 시안",
  parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Current: Story = {
  name: "지금 · 탑승권 (BUSAN 배지)",
  render: () => <Grid render={(p) => <SpotTicketCard {...p} imageSrc={p.imageSrc} />} />,
};

export const Postcard: Story = {
  name: "A · 엽서 (배지 없이 담담하게)",
  render: () => <Grid render={(p) => <SpotPostcardCard {...p} />} />,
};

export const Overlay: Story = {
  name: "B · 사진이 전부 (배지는 지역 이름)",
  render: () => <Grid render={(p) => <SpotOverlayCard {...p} />} />,
};

export const Rank: Story = {
  name: "C · 순위 매거진 (큰 숫자)",
  render: () => <Grid render={(p) => <SpotRankCard {...p} />} />,
};
