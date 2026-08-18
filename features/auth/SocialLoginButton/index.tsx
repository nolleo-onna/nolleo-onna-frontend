"use client";

import { useEffect, useState } from "react";

import { getLastLoginProvider, markLoginAttempt } from "@/features/auth/lastLogin";
import { cn } from "@/utils/cn";
import { OAUTH_URLS, type OAuthProvider } from "@/constants/auth";

interface SocialLoginButtonProps {
  provider: OAuthProvider;
}

const PROVIDER_CONFIG: Record<
  OAuthProvider,
  { label: string; className: string }
> = {
  kakao: {
    label: "카카오로 시작하기",
    className: "bg-kakao-bg text-kakao-text hover:brightness-95",
  },
  naver: {
    label: "네이버로 시작하기",
    className: "bg-[#03C75A] text-white hover:brightness-95",
  },
  google: {
    label: "Google로 시작하기",
    className:
      "border border-google-border bg-white text-google-text hover:bg-gray-50",
  },
};

export default function SocialLoginButton({ provider }: SocialLoginButtonProps) {
  const { label, className } = PROVIDER_CONFIG[provider];
  const [isLastUsed, setIsLastUsed] = useState(false);

  useEffect(() => {
    // localStorage는 마운트 후에만 읽을 수 있음 (프리렌더 HTML과의 hydration 불일치 방지)
    // eslint-disable-next-line react-hooks/set-state-in-effect -- 위 이유로 마운트 후 1회 동기화
    setIsLastUsed(getLastLoginProvider() === provider);
  }, [provider]);

  return (
    <a
      href={OAUTH_URLS[provider]}
      onClick={() => markLoginAttempt(provider)}
      className={cn(
        "relative flex h-12 w-full items-center justify-center rounded-full text-base font-semibold shadow-sm transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-md active:scale-95 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean-400 focus-visible:ring-offset-2",
        className,
      )}
    >
      {label}
      {isLastUsed && (
        <span className="absolute -top-2.5 right-4 rounded-full bg-navy-900 px-2 py-0.5 text-[10px] font-semibold text-lime-300 shadow-md">
          ✓ 마지막으로 로그인했어요
        </span>
      )}
    </a>
  );
}
