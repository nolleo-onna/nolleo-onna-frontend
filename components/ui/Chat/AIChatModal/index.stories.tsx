import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';
import { useAIChat } from '@/hooks/useAIChat';
import { AIChatModal } from './index';
import type { AIChatModalProps } from './index';

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

// render가 실제 상태는 각자 useAIChat()으로 만들어 넘기므로, 여기 args는
// 타입을 만족시키기 위한 자리표시자일 뿐 실제로 쓰이지 않는다.
const placeholderArgs = {
  isOpen: false,
  onClose: () => {},
  messages: [],
  inputValue: '',
  setInputValue: () => {},
  isLoading: false,
  isAwaitingConfirmation: false,
  completedPairId: null,
  inputError: null,
  sendMessage: async () => true,
  sendConfirmation: async () => {},
  reset: () => {},
};

// ── 모달 열기/닫기 토글 래퍼 ─────────────────────────────────────────────────
// 실제 앱에서는 AIChatProvider가 useAIChat 상태를 소유하지만, 스토리북에는
// 그 provider가 없으니 여기서 직접 훅을 호출해 props로 넘겨준다.
function ModalWrapper() {
  const [isOpen, setIsOpen] = useState(false);
  const chat = useAIChat();

  return (
    <div className="w-full h-screen bg-gray-100 flex items-center justify-center relative">
      {/* 홈 배경 느낌 */}
      <div className="text-center space-y-4">
        <p className="text-gray-500 text-sm">홈 화면 영역 (배경)</p>
        <button
          onClick={() => setIsOpen(true)}
          className="px-6 py-3 rounded-full bg-gradient-to-r from-[#0d3080] to-[#1a4fc8] text-white text-sm font-semibold shadow-lg hover:scale-105 transition-transform"
        >
          온나에게 물어보기
        </button>
      </div>

      <AIChatModal isOpen={isOpen} onClose={() => setIsOpen(false)} {...chat} />
    </div>
  );
}

// ── Stories ───────────────────────────────────────────────────────────────────

/** 기본: 버튼 클릭으로 모달 열기/닫기 + mock 대화 전체 플로우 테스트 */
export const Default: Story = {
  args: placeholderArgs,
  render: () => <ModalWrapper />,
};

/** 모달이 항상 열려있는 상태 (UI 확인용) */
function AlwaysOpenWrapper() {
  const chat = useAIChat();

  return (
    <div
      className="w-full h-screen relative"
      style={{ background: 'linear-gradient(135deg, #f0f4ff 0%, #fdf0f5 100%)' }}
    >
      {/* 실제 홈 배경 느낌 */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
        <p className="text-gray-300 text-sm">홈 배경 영역</p>
      </div>
      <AIChatModal isOpen onClose={() => {}} {...chat} />
    </div>
  );
}

export const AlwaysOpen: Story = {
  args: placeholderArgs,
  parameters: {
    layout: 'fullscreen',
  },
  render: () => <AlwaysOpenWrapper />,
};

// ── API 없이 고정 메시지로 보는 화면들 ────────────────────────────────────────
const SAMPLE_MESSAGES: AIChatModalProps['messages'] = [
  { id: 'm1', role: 'user', content: '광안리에서 연인이랑 야경 보는 코스 짜줘' },
  { id: 'm2', role: 'assistant', content: '좋아요! 광안리 야경 데이트 코스로 짜볼게요.\n예산은 1인 기준 어느 정도로 생각하세요?' },
  { id: 'm3', role: 'user', content: '5만원 안쪽' },
  { id: 'm4', role: 'user', content: '너무 붐비는 곳은 빼줘' },
  {
    id: 'm5',
    role: 'assistant',
    content: '정리해볼게요.\n· 지역: 광안리\n· 동행: 연인\n· 분위기: 야경, 한적하게\n· 예산: 1인 5만원 이내\n이대로 코스를 만들까요?',
  },
];

function StaticFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative h-screen w-full" style={{ background: 'linear-gradient(135deg, #9fd3ff 0%, #3d8bff 45%, #0d3080 100%)' }}>
      {children}
    </div>
  );
}

/** 첫 화면 — 인사와 눌러 쓰는 예시 */
export const Empty: Story = {
  args: { ...placeholderArgs, isOpen: true },
  parameters: { layout: 'fullscreen' },
  render: (args) => (
    <StaticFrame>
      <AIChatModal {...args} />
    </StaticFrame>
  ),
};

/** 대화 중 — 이어 보낸 말풍선 묶음과 확인 버튼 */
export const Conversation: Story = {
  args: { ...placeholderArgs, isOpen: true, messages: SAMPLE_MESSAGES, isAwaitingConfirmation: true },
  parameters: { layout: 'fullscreen' },
  render: (args) => (
    <StaticFrame>
      <AIChatModal {...args} />
    </StaticFrame>
  ),
};

/** 답을 쓰는 중 */
export const Typing: Story = {
  args: { ...placeholderArgs, isOpen: true, messages: SAMPLE_MESSAGES.slice(0, 3), isLoading: true },
  parameters: { layout: 'fullscreen' },
  render: (args) => (
    <StaticFrame>
      <AIChatModal {...args} />
    </StaticFrame>
  ),
};

/** 코스 완성 */
export const Completed: Story = {
  args: {
    ...placeholderArgs,
    isOpen: true,
    completedPairId: 'sample-pair',
    messages: [
      ...SAMPLE_MESSAGES,
      { id: 'm6', role: 'user', content: '응 좋아' },
      { id: 'm7', role: 'assistant', status: 'COMPLETED', content: '광안리 야경 데이트 코스를 만들었어요!\n결과 페이지로 이동할게요.' },
    ],
  },
  parameters: { layout: 'fullscreen' },
  render: (args) => (
    <StaticFrame>
      <AIChatModal {...args} />
    </StaticFrame>
  ),
};
