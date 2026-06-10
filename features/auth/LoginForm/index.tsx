"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

import SocialLoginButton from "@/features/auth/SocialLoginButton";

const RETURN_URL_KEY = "auth:returnUrl";

export default function LoginForm() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const returnUrl = searchParams.get("returnUrl");

    if (returnUrl && returnUrl.startsWith("/") && !returnUrl.startsWith("//")) {
      sessionStorage.setItem(RETURN_URL_KEY, returnUrl);
    }
  }, [searchParams]);

  return (
    <div className="flex w-full max-w-sm flex-col gap-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">로그인</h1>
        <p className="mt-2 text-sm text-gray-500">
          소셜 계정으로 간편하게 시작하세요
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <SocialLoginButton provider="kakao" />
        <SocialLoginButton provider="naver" />
        <SocialLoginButton provider="google" />
      </div>
    </div>
  );
}