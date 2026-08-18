import { Suspense } from "react";

import MyCourseListView from "@/features/course/components/MyCourseListView";

export default function CoursePage() {
  return (
    // MyCourseListView가 useSearchParams(정렬/필터 상태)를 읽어서 Suspense 필요
    <Suspense>
      <MyCourseListView />
    </Suspense>
  );
}
