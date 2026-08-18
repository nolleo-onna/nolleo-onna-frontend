"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { ME_QUERY_KEY } from "@/hooks/useMe";
import { commitLoginSuccess } from "@/features/auth/lastLogin";
import { fetchMe } from "@/libs/api/auth";

const RETURN_URL_KEY = "auth:returnUrl";

function getReturnUrl(): string {
  const returnUrl = sessionStorage.getItem(RETURN_URL_KEY);
  sessionStorage.removeItem(RETURN_URL_KEY);

  if (returnUrl && returnUrl.startsWith("/") && !returnUrl.startsWith("//")) {
    return returnUrl;
  }

  return "/";
}

export default function AuthCallback() {
  const router = useRouter();
  const queryClient = useQueryClient();

  useEffect(() => {
    let cancelled = false;

    fetchMe()
      .then((user) => {
        if (cancelled) return;
        commitLoginSuccess();
        queryClient.setQueryData(ME_QUERY_KEY, user);
        router.replace(getReturnUrl());
      })
      .catch(() => {
        if (cancelled) return;
        queryClient.setQueryData(ME_QUERY_KEY, null);
        router.replace("/login");
      });

    return () => {
      cancelled = true;
    };
  }, [router, queryClient]);

  return (
    <main className="mt-16 flex min-h-[calc(100vh-64px)] items-center justify-center">
      <p className="text-sm text-gray-500">로그인 처리 중...</p>
    </main>
  );
}