import type { Metadata } from "next";

import PostDetail from "@/features/hankkut/components/PostDetail";

export const metadata: Metadata = {
  title: "게시글 | 놀러온나",
};

interface PostPageProps {
  params: Promise<{ postId: string }>;
}

// 유저 작성 글 상세. 목데이터 한끗(/hankkut/[id], id: number)과 데이터 소스가
// 달라(localStorage, uuid) 경로를 분리했다.
export default async function HankkutPostPage({ params }: PostPageProps) {
  const { postId } = await params;

  return (
    <div className="pt-16">
      <main className="mx-auto w-full max-w-3xl px-5 py-10 md:px-10">
        <PostDetail postId={postId} />
      </main>
    </div>
  );
}
