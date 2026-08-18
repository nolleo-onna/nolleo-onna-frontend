"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useMe } from "@/hooks/useMe";

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const { data: user, isLoading } = useMe();

  useEffect(() => {
    if (!isLoading && !user) {
      const returnUrl = `${window.location.pathname}${window.location.search}`;
      router.replace(`/login?returnUrl=${encodeURIComponent(returnUrl)}`);
    }
  }, [isLoading, user, router]);

  if (isLoading) {
    return (
      <main className="mt-16 flex min-h-[calc(100vh-64px)] items-center justify-center">
        <p className="text-sm text-gray-500">확인 중...</p>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}