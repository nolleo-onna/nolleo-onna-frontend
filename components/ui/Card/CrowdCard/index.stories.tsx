import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import CrowdCard from "./index";

const meta = {
	title: "UI/Card/CrowdCard",
	component: CrowdCard,
	tags: ["autodocs"],
} satisfies Meta<typeof CrowdCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		imageSrc: "https://picsum.photos/600/400",
		name: "해운대 해수욕장",
		rank: 1,
		crowdStatus: "보통",
		peakInfo: "해운대구 · 14~17시 피크",
	},
	render: (args) => (
		<div className="w-80">
			<CrowdCard {...args} />
		</div>
	),
};

export const Relaxed: Story = {
	args: {
		imageSrc: "https://picsum.photos/600/400",
		name: "광안리 해수욕장",
		rank: 2,
		crowdStatus: "여유",
		peakInfo: "수영구 · 18~20시 피크",
	},
	render: (args) => (
		<div className="w-80">
			<CrowdCard {...args} />
		</div>
	),
};

export const Crowded: Story = {
	args: {
		imageSrc: "https://picsum.photos/600/400",
		name: "감천문화마을",
		rank: 3,
		crowdStatus: "혼잡",
		peakInfo: "사하구 · 11~15시 피크",
	},
	render: (args) => (
		<div className="w-80">
			<CrowdCard {...args} />
		</div>
	),
};

export const VeryCrowded: Story = {
	args: {
		imageSrc: "https://picsum.photos/600/400",
		name: "국제시장",
		rank: 4,
		crowdStatus: "매우혼잡",
		peakInfo: "중구 · 13~18시 피크",
	},
	render: (args) => (
		<div className="w-80">
			<CrowdCard {...args} />
		</div>
	),
};