import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import AIChatProvider from "@/providers/AIChatProvider";
import HeroSection from "./index";
import HeroChatCenter from "./aiFirst/HeroChatCenter";
import HeroChatShowcase from "./aiFirst/HeroChatShowcase";
import HeroOnnaGreets from "./aiFirst/HeroOnnaGreets";
import HeroBento from "./aiFirst/HeroBento";
import HeroQuestionCloud from "./aiFirst/HeroQuestionCloud";
import CourseSearchBarForm from "./aiFirst/courseForm/CourseSearchBarForm";
import CourseStepForm from "./aiFirst/courseForm/CourseStepForm";
import CourseTicketForm from "./aiFirst/courseForm/CourseTicketForm";
import { installCourseFormFetchMock } from "./aiFirst/courseForm/courseFormStoryMocks";

// 피드백: 히어로에서 온나 채팅이 메인인데 "온나에게 물어보기"가 검색 카드 구석의 작은 버튼이라 안 보인다.
// 1순위 AI 채팅, 2순위 내 코스 만들기가 되도록 다시 짠 시안들. 누르면 실제 채팅 모달이 열린다.
const meta = {
  title: "Home/HeroSection/AI 채팅 우선 시안",
  parameters: { layout: "fullscreen", nextjs: { appDirectory: true, navigation: { pathname: "/" } } },
  decorators: [
    (Story) => {
      const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
      return (
        <QueryClientProvider client={queryClient}>
          <AIChatProvider>
            <div className="min-h-screen bg-gray-50">
              <Story />
            </div>
          </AIChatProvider>
        </QueryClientProvider>
      );
    },
  ],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Current: Story = { name: "지금 · 비교용", render: () => <HeroSection /> };

// A · 대화창이 곧 히어로로 결정 — 아래 "조건 골라 내 코스 만들기" 폼만 바꿔 끼운 시안들
export const A1Sentence: Story = { name: "A-1 · 조건 폼: 빈칸 채우기 문장", render: () => <HeroChatCenter /> };

export const A2SearchBar: Story = {
  name: "A-2 · 조건 폼: 한 줄 검색 바",
  render: () => <HeroChatCenter courseForm={<CourseSearchBarForm />} dividerLabel="또는" />,
  // 개발 API에 닿지 않아도 "이재"만 쳐서 후보가 뜨는지 보이게 — 실제 응답 일부를 흉내 낸다
  loaders: [async () => installCourseFormFetchMock()],
};

export const A3Ticket: Story = {
  name: "A-3 · 조건 폼: 코스 탑승권",
  render: () => <HeroChatCenter courseForm={<CourseTicketForm />} dividerLabel="또는 조건만 골라서" />,
};

export const A4Steps: Story = {
  name: "A-4 · 조건 폼: 한 번에 하나씩",
  render: () => <HeroChatCenter courseForm={<CourseStepForm />} dividerLabel="또는 질문 네 개로" />,
};

export const BChatShowcase: Story = { name: "B · 온나가 먼저 보여주는 히어로", render: () => <HeroChatShowcase /> };

export const DOnnaGreets: Story = { name: "D · 온나가 먼저 말을 거는 히어로", render: () => <HeroOnnaGreets /> };

export const EBento: Story = { name: "E · 벤토 카드 (온나 2/3 · 조건 1/3)", render: () => <HeroBento /> };

export const FQuestionCloud: Story = { name: "F · 떠다니는 질문 풍선 + 채팅 독", render: () => <HeroQuestionCloud /> };
