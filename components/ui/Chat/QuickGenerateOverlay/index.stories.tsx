import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import QuickGenerateOverlay from './index';

// 검색바·문장 완성에서 코스를 만들 때 뜨는 진행 화면. 진행률은 시간에 따라 차오르고 done이면 100%가 된다.
const meta = {
  title: 'UI/Chat/QuickGenerateOverlay',
  component: QuickGenerateOverlay,
  args: { isOpen: true, onClose: () => {}, done: false },
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <div className="min-h-screen bg-gradient-to-b from-ocean-100 to-white">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof QuickGenerateOverlay>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Generating: Story = {};

export const Done: Story = {
  args: { done: true },
};
