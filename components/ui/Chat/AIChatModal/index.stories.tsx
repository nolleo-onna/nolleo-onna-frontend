import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';
import { AIChatModal } from './index';

const meta = {
  title: 'UI/Chat/AIChatModal',
  component: AIChatModal,
  parameters: {
    nextjs: {
      appDirectory: true,
    },
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof AIChatModal>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── 모달 열기/닫기 토글 래퍼 ─────────────────────────────────────────────────
function ModalWrapper() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="w-full h-screen bg-gray-100 flex items-center justify-center relative">
      {/* 홈 배경 느낌 */}
      <div className="text-center space-y-4">
        <p className="text-gray-500 text-sm">홈 화면 영역 (배경)</p>
        <button
          onClick={() => setIsOpen(true)}
          className="px-6 py-3 rounded-full bg-gradient-to-r from-[#0d3080] to-[#1a4fc8] text-white text-sm font-semibold shadow-lg hover:scale-105 transition-transform"
        >
          ✨ AI에게 말하기
        </button>
      </div>

      <AIChatModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </div>
  );
}

// ── Stories ───────────────────────────────────────────────────────────────────

/** 기본: 버튼 클릭으로 모달 열기/닫기 + mock 대화 전체 플로우 테스트 */
export const Default: Story = {
  render: () => <ModalWrapper />,
  args: {
    isOpen: false,
    onClose: () => {},
  },
};

/** 모달이 항상 열려있는 상태 (UI 확인용) */
export const AlwaysOpen: Story = {
  args: {
    isOpen: true,
    onClose: () => {},
  },
  parameters: {
    layout: 'fullscreen',
  },
  render: (args) => (
    <div
      className="w-full h-screen relative"
      style={{ background: 'linear-gradient(135deg, #f0f4ff 0%, #fdf0f5 100%)' }}
    >
      {/* 실제 홈 배경 느낌 */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
        <p className="text-gray-300 text-sm">홈 배경 영역</p>
      </div>
      <AIChatModal {...args} />
    </div>
  ),
};