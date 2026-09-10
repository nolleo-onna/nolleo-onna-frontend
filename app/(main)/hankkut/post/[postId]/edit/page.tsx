import type { Metadata } from "next";

import PostWriteForm from "@/features/hankkut/components/PostWriteForm";

export const metadata: Metadata = {
  title: "글 수정 | 놀러온나",
};

interface EditPageProps {
  params: Promise<{ postId: string }>;
}

// PostWriteForm이 postId로 글을 받아 갤러리 헤더와 기존 값을 클라이언트에서 채운다.
export default async function HankkutPostEditPage({ params }: EditPageProps) {
  const { postId } = await params;

  return (
    <div className="pt-16">
      <main className="mx-auto w-full max-w-3xl px-5 py-10 md:px-10">
        <PostWriteForm postId={postId} />
      </main>
    </div>
  );
}
