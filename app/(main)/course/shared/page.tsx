import type { Metadata } from "next";

import PublicCourseList from "@/features/course/components/PublicCourseList";

export const metadata: Metadata = {
  title: "공유된 코스 전체보기 | 놀러온나",
  description: "놀러온나 여행자들이 만들어 공개한 부산 여행 코스를 모아 봅니다.",
};

// 홈 "지금 인기 있는 코스"의 전체보기. 공개 코스라 로그인 없이 볼 수 있다.
export default function PublicCoursesPage() {
  return (
    <div className="pt-16">
      <main className="mx-auto w-full max-w-[1280px] px-5 py-10 md:px-10 lg:px-20">
        <PublicCourseList />
      </main>
    </div>
  );
}
