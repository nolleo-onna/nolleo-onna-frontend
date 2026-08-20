import type { Metadata } from "next";

import PostWriteForm from "@/features/hankkut/components/PostWriteForm";

export const metadata: Metadata = {
  title: "글 수정 | 놀러온나",
};

interface EditPageProps {
  params: Promise<{ postId: string }>;
}

// 글 데이터가 localStorage에만 있어 서버에서 갤러리를 미리 알 수 없다 —
// PostWriteForm이 postId로 글을 찾아 regionSlug/헤더까지 클라이언트에서 채운다.
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
