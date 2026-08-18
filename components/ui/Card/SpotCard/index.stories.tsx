import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import SpotCard from "./index";

const meta = {
	title: "UI/Card/SpotCard",
	component: SpotCard,
	tags: ["autodocs"],
} satisfies Meta<typeof SpotCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		imageSrc: "https://picsum.photos/600/400",
		name: "해운대 해수욕장",
		location: "부산 해운대구",
		rating: 4.8,
		reviewCount: "2.1k",
		price: 15000,
		crowdStatus: "보통",
	},
	render: (args) => (
		<div className="w-80">
			<SpotCard {...args} />
		</div>
	),
};

export const FreePlace: Story = {
	args: {
		imageSrc: "https://picsum.photos/600/401",
		name: "광안리 해수욕장",
		location: "부산 수영구",
		rating: 4.9,
		reviewCount: "3.4k",
		price: null,
		crowdStatus: "여유",
	},
	render: (args) => (
		<div className="w-80">
			<SpotCard {...args} />
		</div>
	),
};

export const CrowdedPlace: Story = {
	args: {
		imageSrc: "https://picsum.photos/600/402",
		name: "감천문화마을",
		location: "부산 사하구",
		rating: 4.6,
		reviewCount: "1.8k",
		price: 8000,
		crowdStatus: "매우혼잡",
	},
	render: (args) => (
		<div className="w-80">
			<SpotCard {...args} />
		</div>
	),
};

export const LongTitle: Story = {
	args: {
		imageSrc: "https://picsum.photos/600/403",
		name: "부산에서 가장 아름다운 해안 절경을 감상할 수 있는 관광 명소",
		location: "부산 기장군",
		rating: 4.7,
		reviewCount: "5.2k",
		price: 12000,
		crowdStatus: "혼잡",
	},
	render: (args) => (
		<div className="w-80">
			<SpotCard {...args} />
		</div>
	),
};