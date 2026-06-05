import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import Header from "./index";

const meta = {
	title: "Layout/Header",
	component: Header,
	tags: ["autodocs"],
	parameters: {
		layout: "fullscreen",
	},
} satisfies Meta<typeof Header>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const OnSpotPage: Story = {
	parameters: {
		nextjs: {
			navigation: {
				pathname: "/spot",
			},
		},
	},
};

export const OnCoursePage: Story = {
	parameters: {
		nextjs: {
			navigation: {
				pathname: "/course",
			},
		},
	},
};
