import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import CardBase from "./index";

const meta = {
	title: "UI/Card",
	component: CardBase,
	tags: ["autodocs"],
} satisfies Meta<typeof CardBase>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		imageSrc: "https://picsum.photos/600/400",
		imageAlt: "sample image",
	},
	render: (args) => (
		<div className="w-80">
			<CardBase {...args}>
				<h3 className="text-lg font-bold">해운대 해수욕장</h3>
				<p className="text-sm text-gray-500">
					부산 대표 관광지
				</p>
			</CardBase>
		</div>
	),
};

export const WithBadges: Story = {
	args: {
		imageSrc: "https://picsum.photos/600/400",
		imageAlt: "sample image",
		badges: [
			{
				label: "무료",
				variant: "free",
			},
			{
				label: "여유",
				variant: "crowd",
			},
		],
	},
	render: (args) => (
		<div className="w-80">
			<CardBase {...args}>
				<h3 className="text-lg font-bold">광안리 해수욕장</h3>
				<p className="text-sm text-gray-500">
					야경 명소
				</p>
			</CardBase>
		</div>
	),
};

export const RankingCard: Story = {
	args: {
		imageSrc: "https://picsum.photos/600/400",
		imageAlt: "sample image",
		topLeftSlot: (
			<div className="flex h-10 w-10 items-center justify-center rounded-full bg-pink-500 text-lg font-bold text-white">
				1
			</div>
		),
		badges: [
			{
				label: "보통",
				variant: "crowd",
			},
		],
	},
	render: (args) => (
		<div className="w-80">
			<CardBase {...args}>
				<h3 className="text-lg font-bold">감천문화마을</h3>
				<p className="text-sm text-gray-500">
					부산 인기 관광지
				</p>
			</CardBase>
		</div>
	),
};

export const Square: Story = {
	args: {
		imageSrc: "https://picsum.photos/500",
		imageAlt: "sample image",
		aspectRatio: "square",
	},
	render: (args) => (
		<div className="w-72">
			<CardBase {...args}>
				<h3 className="font-bold">정사각형 카드</h3>
			</CardBase>
		</div>
	),
};