import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import CourseCard from "./index";

const meta: Meta<typeof CourseCard> = {
  title: "UI/Card/CourseCard",
  component: CourseCard,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof CourseCard>;

export const Default: Story = {
  args: {
    imageSrc: "https://picsum.photos/seed/beach/400/600",
    badge: "상황별",
    emoji: "🏖️",
    subTitle: "SOLO HEALING",
    title: "혼자 힐링하는 날",
    description: "조용한 바다 + 카페 1곳",
  },
  render: (args) => (
    <div className="w-72">
      <CourseCard {...args} />
    </div>
  ),
};

export const Date: Story = {
  args: {
    imageSrc: "https://picsum.photos/seed/rose/400/600",
    badge: "상황별",
    emoji: "🌹",
    subTitle: "CHEAP & CHIC",
    title: "짠내 데이트",
    description: "5만원 이하 감성 코스",
  },
  render: (args) => (
    <div className="w-72">
      <CourseCard {...args} />
    </div>
  ),
};

export const Rainy: Story = {
  args: {
    imageSrc: "https://picsum.photos/seed/rain/400/600",
    badge: "상황별",
    emoji: "🌧️",
    subTitle: "RAINY DAY",
    title: "비 와도 괜찮아",
    description: "실내 위주 큐레이션",
  },
  render: (args) => (
    <div className="w-72">
      <CourseCard {...args} />
    </div>
  ),
};