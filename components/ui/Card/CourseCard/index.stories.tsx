import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import CourseCard from "./index";

const meta = {
	title: "UI/Card/CourseCard",
	component: CourseCard,
	tags: ["autodocs"],
} satisfies Meta<typeof CourseCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		imageSrc: "https://picsum.photos/600/400",
		title: "부산 1박 2일 감성 여행 코스",
		rating: 4.8,
		reviewCount: "1,248",
		location: "해운대",
		tags: ["관광공사", "인기"],
		originalPrice: 29000,
		discountPrice: 19000,
	},
	render: (args) => (
		<div className="w-80">
			<CourseCard {...args} />
		</div>
	),
};

export const WithoutPrice: Story = {
	args: {
		imageSrc: "https://picsum.photos/600/400",
		title: "부산 야경 드라이브 코스",
		rating: 4.6,
		reviewCount: "532",
		location: "광안리",
		tags: ["관광공사"],
	},
	render: (args) => (
		<div className="w-80">
			<CourseCard {...args} />
		</div>
	),
};

export const LongTitle: Story = {
	args: {
		imageSrc: "https://picsum.photos/600/400",
		title:
			"부산 대표 관광지와 감성 카페를 하루 만에 둘러볼 수 있는 추천 여행 코스",
		rating: 4.9,
		reviewCount: "2,012",
		location: "부산",
		tags: ["관광공사", "추천"],
		discountPrice: 15000,
	},
	render: (args) => (
		<div className="w-80">
			<CourseCard {...args} />
		</div>
	),
};