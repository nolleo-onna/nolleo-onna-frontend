"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function BackButton() {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.back()}
      aria-label="뒤로 가기"
      className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-navy-900 transition-colors hover:bg-white"
    >
      <ArrowLeft className="h-5 w-5" />
    </button>
  );
}
