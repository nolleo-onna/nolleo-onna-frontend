import type { OAuthProvider } from "@/constants/auth";

interface ProviderLogoProps {
  provider: OAuthProvider;
  className?: string;
}

/**
 * 소셜 로그인 버튼의 브랜드 로고.
 * 이미지 파일 대신 인라인 SVG로 둔다 — 요청이 늘지 않고, 어떤 크기로 키워도 흐려지지 않는다.
 * 각 사의 브랜드 가이드에 맞춰 카카오는 검정 말풍선, 네이버는 흰 N, 구글은 4색 G를 쓴다.
 */
export default function ProviderLogo({ provider, className }: ProviderLogoProps) {
  if (provider === "kakao") {
    return (
      <svg aria-hidden viewBox="0 0 24 24" className={className} fill="currentColor">
        <path d="M12 3C6.48 3 2 6.48 2 10.8c0 2.76 1.83 5.18 4.6 6.56-.2.72-.73 2.63-.83 3.04-.13.5.18.5.39.36.16-.11 2.6-1.76 3.65-2.48.7.1 1.43.16 2.19.16 5.52 0 10-3.48 10-7.64S17.52 3 12 3z" />
      </svg>
    );
  }

  if (provider === "naver") {
    return (
      <svg aria-hidden viewBox="0 0 24 24" className={className} fill="currentColor">
        <path d="M16.273 12.845 7.376 0H0v24h7.726V11.156L16.624 24H24V0h-7.727v12.845z" />
      </svg>
    );
  }

  return (
    <svg aria-hidden viewBox="0 0 48 48" className={className}>
      <path
        fill="#4285F4"
        d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z"
      />
      <path
        fill="#34A853"
        d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z"
      />
      <path
        fill="#FBBC05"
        d="M11.69 28.18C11.25 26.86 11 25.45 11 24s.25-2.86.69-4.18v-5.7H4.34C2.85 17.09 2 20.45 2 24s.85 6.91 2.34 9.88l7.35-5.7z"
      />
      <path
        fill="#EA4335"
        d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z"
      />
    </svg>
  );
}
