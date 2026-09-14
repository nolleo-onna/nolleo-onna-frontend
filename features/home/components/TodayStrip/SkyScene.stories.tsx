import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import SkyScene from "./SkyScene";
import { SKY_PHASE_LABEL } from "@/features/home/utils/todaySky";

import type { SkyPhase } from "@/features/home/utils/todaySky";
import type { PtyCode } from "@/types/weather";

const PHASES: SkyPhase[] = ["dawn", "day", "dusk", "night"];
const WEATHERS: { pty: PtyCode; label: string }[] = [
  { pty: 0, label: "맑음" },
  { pty: 1, label: "비" },
  { pty: 2, label: "비/눈" },
  { pty: 3, label: "눈" },
];

const meta = {
  title: "Home/TodayStrip/SkyScene",
  component: SkyScene,
  args: { phase: "day", pty: 0, windy: false, animated: true },
  argTypes: {
    phase: { control: "inline-radio", options: PHASES },
    pty: { control: "inline-radio", options: [0, 1, 2, 3] },
  },
} satisfies Meta<typeof SkyScene>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  decorators: [
    (Story) => (
      <div className="relative h-64 max-w-md overflow-hidden rounded-[28px]">
        <Story />
      </div>
    ),
  ],
};

// 시간대 4 × 날씨 4 — 16가지 하늘을 한 번에 비교
export const AllSkies: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {WEATHERS.flatMap(({ pty, label }) =>
        PHASES.map((phase) => (
          <div key={`${pty}-${phase}`} className="relative h-36 overflow-hidden rounded-2xl">
            <SkyScene phase={phase} pty={pty} windy={pty === 1} />
            <span className="absolute bottom-2 left-3 text-xs font-semibold text-white">
              {label} · {SKY_PHASE_LABEL[phase]}
            </span>
          </div>
        )),
      )}
    </div>
  ),
};
