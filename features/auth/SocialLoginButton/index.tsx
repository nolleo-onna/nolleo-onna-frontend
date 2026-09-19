"use client";

import { useEffect, useState } from "react";

import ProviderLogo from "@/features/auth/SocialLoginButton/ProviderLogo";
import { getLastLoginProvider, markLoginAttempt } from "@/features/auth/lastLogin";
import { cn } from "@/utils/cn";
import { OAUTH_URLS, type OAuthProvider } from "@/constants/auth";

interface SocialLoginButtonProps {
  provider: OAuthProvider;
}

const PROVIDER_CONFIG: Record<
  OAuthProvider,
  { label: string; className: string; logoClassName: string }
> = {
  kakao: {
    label: "카카오로 시작하기",
    className: "bg-kakao-bg text-kakao-text hover:brightness-95",
    // 말풍선은 글자색(검정)을 그대로 따른다
    logoClassName: "h-[18px] w-[18px]",
  },
  naver: {
    label: "네이버로 시작하기",
    className: "bg-[#03C75A] text-white hover:brightness-95",
    // 네이버 N은 획이 굵어 같은 크기면 더 커 보인다 — 조금 줄인다
    logoClassName: "h-[15px] w-[15px]",
  },
  google: {
    label: "Google로 시작하기",
    className:
      "border border-google-border bg-white text-google-text hover:bg-gray-50",
    logoClassName: "h-[19px] w-[19px]",
  },
};

export default function SocialLoginButton({ provider }: SocialLoginButtonProps) {
  const { label, className, logoClassName } = PROVIDER_CONFIG[provider];
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
      {/* 로고는 왼쪽에 고정하고 글자는 버튼 한가운데 둔다 — 세 버튼의 글자 시작점이 들쭉날쭉해 보이지 않는다 */}
      <ProviderLogo provider={provider} className={cn("absolute left-5", logoClassName)} />
      {label}
      {isLastUsed && (
        <span className="absolute -top-2.5 right-4 rounded-full bg-navy-900 px-2 py-0.5 text-[10px] font-semibold text-lime-300 shadow-md">
          ✓ 마지막으로 로그인했어요
        </span>
      )}
    </a>
  );
}
