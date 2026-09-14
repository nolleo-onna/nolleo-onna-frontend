import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import PostWriteForm from "./index";
import { ME_QUERY_KEY } from "@/hooks/useMe";

import type { User } from "@/types/auth";

// 글쓰기는 로그인해야 열려서, 캐시에 샘플 사용자를 넣어 새 글 작성 화면을 확인한다
const USER: User = { userId: 1, email: "traveler@nolleo-onna.site", nickname: "김서준", role: "USER" };

const meta = {
  title: "Hankkut/PostWriteForm",
  component: PostWriteForm,
  args: { regionSlug: "seomyeon" },
  parameters: { layout: "fullscreen", nextjs: { appDirectory: true } },
  decorators: [
    (Story) => {
      const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false, staleTime: Infinity } },
      });
      queryClient.setQueryData(ME_QUERY_KEY, USER);
      return (
        <QueryClientProvider client={queryClient}>
          <div className="min-h-screen bg-gray-50">
            <main className="mx-auto w-full max-w-[1120px] px-5 py-10 md:px-10">
              <Story />
            </main>
          </div>
        </QueryClientProvider>
      );
    },
  ],
} satisfies Meta<typeof PostWriteForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const NewPost: Story = {};
