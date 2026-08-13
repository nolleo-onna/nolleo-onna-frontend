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

  return (
    <a
      href={OAUTH_URLS[provider]}
      className={cn(
        "flex h-12 w-full items-center justify-center rounded-full text-base font-semibold transition-all duration-200 ease-out active:scale-95",
        className,
      )}
    >
      {label}
    </a>
  );
}