import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import TourCourseCard from "./index";

const meta = {
  title: "UI/Card/TourCourseCard",
  component: TourCourseCard,
  tags: ["autodocs"],
} satisfies Meta<typeof TourCourseCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    imageSrc: "https://picsum.photos/seed/market/600/400",
    title: "다이나믹한 부산의 매력을 만나다",
    rating: 4.8,
    reviewCount: "2.1k",
    location: "중구",
    regionTags: ["중구"],
  },
  render: (args) => (
    <div className="w-80">
      <TourCourseCard {...args} />
    </div>
  ),
};