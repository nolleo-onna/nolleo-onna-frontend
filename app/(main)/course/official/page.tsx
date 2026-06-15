import { Suspense } from "react";

import OfficialCourseView from "@/features/course/components/OfficialCourseView";

export default function OfficialCoursePage() {
  return (
    <Suspense fallback={null}>
      <OfficialCourseView />
    </Suspense>
  );
}