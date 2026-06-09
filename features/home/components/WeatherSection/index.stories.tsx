import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import WeatherSection from "./index";

const meta: Meta<typeof WeatherSection> = {
  title: "Home/WeatherSection",
  component: WeatherSection,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof WeatherSection>;

export const Default: Story = {};

export const Crowded: Story = {
  args: {
    data: {
      date: "6월 9일 월요일",
      weather: { high: 28, low: 20, description: "흐림 · 오후 소나기" },
      dust: { grade: "보통", pm: 45, recommendation: "민감군 주의" },
      crowd: { grade: "매우혼잡", description: "주말 · 피크타임" },
    },
  },
};