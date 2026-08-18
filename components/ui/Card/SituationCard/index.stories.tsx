import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { SituationCardOverlay } from "./index";

const meta = {
	title: "UI/Card/SituationCard",
	component: SituationCardOverlay,
	tags: ["autodocs"],
} satisfies Meta<typeof SituationCardOverlay>;

export default meta;

type Story = StoryObj<typeof meta>;

export const RainyDay: Story = {
	args: {
		imageSrc: "https://picsum.photos/800/450",
		tag: "상황별",
		emoji: "🌧️",
		title: "비 와도 괜찮아",
		subtitle: "실내 위주 큐레이션",
	},
	render: (args) => (
		<div className="w-80">
			<SituationCardOverlay {...args} />
		</div>
	),
};

export const DateCourse: Story = {
	args: {
		imageSrc: "https://picsum.photos/800/451",
		tag: "추천 코스",
		emoji: "🌙",
		title: "야경 데이트 코스",
		subtitle: "광안리 · 해운대",
	},
	render: (args) => (
		<div className="w-80">
			<SituationCardOverlay {...args} />
		</div>
	),
};

export const FamilyTrip: Story = {
	args: {
		imageSrc: "https://picsum.photos/800/452",
		tag: "가족 여행",
		emoji: "👨‍👩‍👧‍👦",
		title: "아이와 함께 가기 좋은 곳",
		subtitle: "부산 인기 명소",
	},
	render: (args) => (
		<div className="w-80">
			<SituationCardOverlay {...args} />
		</div>
	),
};

export const BudgetTrip: Story = {
	args: {
		imageSrc: "https://picsum.photos/800/453",
		tag: "가성비",
		emoji: "💰",
		title: "3만원 이하 부산 여행",
		subtitle: "학생 추천 코스",
	},
	render: (args) => (
		<div className="w-80">
			<SituationCardOverlay {...args} />
		</div>
	),
};