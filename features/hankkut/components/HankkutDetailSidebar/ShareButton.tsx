"use client";

import { Check, Share2 } from "lucide-react";

import { useShareCurrentUrl } from "@/hooks/useShareCurrentUrl";

export default function ShareButton({ title }: { title: string }) {
  const { copied, share } = useShareCurrentUrl(title);

  return (
    <button
      type="button"
      onClick={share}
      className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-600 transition-colors hover:border-gray-300"
    >
      {copied ? (
        <>
          <Check className="h-4 w-4 text-ocean-600" />
          링크가 복사됐어요
        </>
      ) : (
        <>
          <Share2 className="h-4 w-4" />
          공유하기
        </>
      )}
    </button>
  );
}
