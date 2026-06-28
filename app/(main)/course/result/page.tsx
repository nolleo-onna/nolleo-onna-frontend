import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import CourseResultView from "@/features/course/components/CourseResultView";

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen flex-col items-center justify-center gap-4 bg-white">
          <Loader2 className="h-8 w-8 animate-spin text-pink-400" />
          <p className="text-sm text-gray-500">AI가 코스를 생성하고 있어요...</p>
        </div>
      }
    >
      <CourseResultView />
    </Suspense>
  );
}