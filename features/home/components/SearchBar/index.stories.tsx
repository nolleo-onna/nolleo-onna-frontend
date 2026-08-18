import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import SearchBar from "./index";

const meta = {
  title: "Home/SearchBar",
  component: SearchBar,
  tags: ["autodocs"],
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: "/",
      },
    },
  },
} satisfies Meta<typeof SearchBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};