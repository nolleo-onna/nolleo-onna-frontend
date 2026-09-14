import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import PostDetail from "./index";
import { commentKeys } from "@/features/hankkut/hooks/usePostComments";
import { postKeys } from "@/features/hankkut/hooks/usePosts";
import { ME_QUERY_KEY } from "@/hooks/useMe";

import type { PostComment, PostDetail as PostDetailData } from "@/types/post";

// 운영 DB에 아직 글이 없어 화면을 확인할 수 있도록 만든 샘플. 캐시에 미리 넣어 네트워크 없이 그린다.
const PHOTOS = [
  "https://tong.visitkorea.or.kr/cms/resource/60/3496960_image2_1.jpg",
  "https://tong.visitkorea.or.kr/cms/resource/33/3496933_image2_1.jpg",
  "https://tong.visitkorea.or.kr/cms/resource/12/4017112_image2_1.jpg",
];

const BASE_POST: PostDetailData = {
  id: 1,
  title: "전포 카페거리 평일 오전에 갔더니 골목 전체가 전세 낸 느낌이었어요",
  content:
    "주말엔 대기 때문에 포기했었는데 평일 오전 10시쯤 가니까 사람이 거의 없더라고요.\n\n공구상가 쪽 골목으로 한 블록 들어가면 사진 찍기 좋은 벽이 몇 군데 있어요. 11시 넘어가니까 슬슬 사람이 늘어나서, 사진이 목적이면 일찍 가시는 걸 추천합니다!",
  author: { nickname: "김서준", profileImageUrl: null },
  categoryTags: ["CAFE", "DATE"],
  districtTag: "BUSANJIN_GU",
  imageUrls: PHOTOS,
  likeCount: 12,
  isLiked: false,
  viewCount: 248,
  commentCount: 3,
  createdAt: "2026-09-13T10:24:00",
  updatedAt: "2026-09-13T10:24:00",
};

const COMMENTS: PostComment[] = [
  {
    id: 1,
    author: { nickname: "박민성", profileImageUrl: null },
    content: "오 평일 오전 꿀팁 감사합니다. 다음 주에 가봐야겠네요",
    deleted: false,
    parentCommentId: null,
    createdAt: "2026-09-13T11:02:00",
    updatedAt: "2026-09-13T11:02:00",
    replies: [
      {
        id: 2,
        author: { nickname: "김서준", profileImageUrl: null },
        content: "주차는 근처 공영주차장 쓰시면 편해요!",
        deleted: false,
        parentCommentId: 1,
        createdAt: "2026-09-13T11:20:00",
        updatedAt: "2026-09-13T11:20:00",
        replies: [],
      },
    ],
  },
  {
    id: 3,
    author: { nickname: "이하은", profileImageUrl: null },
    content: "사진 벽 위치 어디쯤인지 궁금해요",
    deleted: false,
    parentCommentId: null,
    createdAt: "2026-09-13T15:40:00",
    updatedAt: "2026-09-13T15:40:00",
    replies: [],
  },
];

const meta = {
  title: "Hankkut/PostDetail",
  component: PostDetail,
  args: { postId: "1" },
  parameters: { layout: "fullscreen", nextjs: { appDirectory: true } },
  decorators: [
    (Story, { parameters }) => {
      const post = (parameters.post as PostDetailData | undefined) ?? BASE_POST;
      const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false, staleTime: Infinity } },
      });
      queryClient.setQueryData(ME_QUERY_KEY, null);
      queryClient.setQueryData(postKeys.detail(post.id), post);
      queryClient.setQueryData(commentKeys.list(post.id), {
        content: COMMENTS,
        totalElements: COMMENTS.length,
        totalPages: 1,
        number: 0,
        size: 20,
        first: true,
        last: true,
        empty: false,
      });
      return (
        <QueryClientProvider client={queryClient}>
          <div className="min-h-screen bg-gray-50 px-5 py-10">
            <div className="mx-auto max-w-3xl">
              <Story />
            </div>
          </div>
        </QueryClientProvider>
      );
    },
  ],
} satisfies Meta<typeof PostDetail>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 사진 3장 — 첫 장이 넓게, 나머지는 반반. 누르면 크게 보기 */
export const WithPhotos: Story = {};

/** 사진 1장 — 원본 비율로 */
export const SinglePhoto: Story = {
  parameters: { post: { ...BASE_POST, imageUrls: PHOTOS.slice(0, 1) } },
};

/** 사진 없이 글만, 이미 좋아요를 누른 상태 */
export const TextOnlyLiked: Story = {
  parameters: { post: { ...BASE_POST, imageUrls: [], isLiked: true, likeCount: 13 } },
};
