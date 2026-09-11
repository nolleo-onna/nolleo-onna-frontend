import type { Metadata } from "next";

import SharedCourseView from "@/features/course/components/SharedCourseView";

export const metadata: Metadata = {
  title: "공유된 코스 | 놀러온나",
};

interface SharedCoursePageProps {
  params: Promise<{ shareToken: string }>;
}

// 공유 링크로 열리는 공개 코스 — 로그인 없이 볼 수 있다.
export default async function SharedCoursePage({ params }: SharedCoursePageProps) {
  const { shareToken } = await params;
  return <SharedCourseView shareToken={shareToken} />;
}
