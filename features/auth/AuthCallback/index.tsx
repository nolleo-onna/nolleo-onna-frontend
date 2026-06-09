"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { fetchMe } from "@/lib/api/auth";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    fetchMe()
      .then(() => {
        router.replace("/");
      })
      .catch(() => {
        router.replace("/login");
      });
  }, [router]);

  return (
    <main className="mt-16 flex min-h-[calc(100vh-64px)] items-center justify-center">
      <p className="text-sm text-gray-500">로그인 처리 중...</p>
    </main>
  );
}