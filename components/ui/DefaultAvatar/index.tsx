interface DefaultAvatarProps {
  /** 어떤 그림을 쓸지 정하는 기준 — 닉네임처럼 사람마다 다르고 안 바뀌는 값 */
  seed: string;
  size?: number;
  className?: string;
}

/**
 * 프로필 사진이 없는 사람(네이버·구글 로그인은 사진을 안 주는 경우가 많다)에게 주는 기본 그림.
 * 바다 테마 셋 중 하나를 쓰되, 매번 다른 그림이 나오면 "내 사진" 같지 않고 댓글에서 사람 구분도 안 되므로
 * 닉네임으로 정해 늘 같은 그림이 나오게 한다.
 */
const THEMES = [
  {
    // 낮 바다 — 로고와 같은 파랑
    from: "#34a6ff",
    to: "#0d3080",
    wave: "#ffffff",
    sky: "#c8f135",
    skyKind: "sun",
  },
  {
    // 노을 바다
    from: "#ffb36b",
    to: "#e5568b",
    wave: "#fff2d8",
    sky: "#fff0a8",
    skyKind: "sun",
  },
  {
    // 밤바다
    from: "#1e4d87",
    to: "#050c1a",
    wave: "#9db5ee",
    sky: "#eeffa0",
    skyKind: "moon",
  },
] as const;

/** 같은 닉네임이면 늘 같은 그림 — 글자 코드를 더해 테마 수로 나눈 나머지 */
export function pickAvatarTheme(seed: string): number {
  let sum = 0;
  for (let i = 0; i < seed.length; i += 1) sum += seed.charCodeAt(i);
  return sum % THEMES.length;
}

export default function DefaultAvatar({ seed, size = 40, className = "" }: DefaultAvatarProps) {
  const themeIndex = pickAvatarTheme(seed);
  const theme = THEMES[themeIndex];
  const gradientId = `avatar-sea-${themeIndex}`;

  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      role="img"
      aria-label="기본 프로필 그림"
      className={`shrink-0 rounded-full ${className}`}
      style={{ width: size, height: size }}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={theme.from} />
          <stop offset="100%" stopColor={theme.to} />
        </linearGradient>
      </defs>

      <rect width="64" height="64" fill={`url(#${gradientId})`} />

      {/* 해 또는 달 */}
      {theme.skyKind === "sun" ? (
        <circle cx="44" cy="20" r="7" fill={theme.sky} opacity="0.95" />
      ) : (
        <>
          <path d="M48 14a8 8 0 1 0 0 14 9 9 0 0 1 0-14Z" fill={theme.sky} opacity="0.95" />
          <circle cx="20" cy="16" r="1.4" fill={theme.sky} opacity="0.8" />
          <circle cx="30" cy="10" r="1" fill={theme.sky} opacity="0.7" />
        </>
      )}

      {/* 파도 두 겹 — 로고의 물결을 단순하게 */}
      <path d="M0 42c8 0 8-6 16-6s8 6 16 6 8-6 16-6 8 6 16 6v22H0Z" fill={theme.wave} opacity="0.35" />
      <path d="M0 50c8 0 8-6 16-6s8 6 16 6 8-6 16-6 8 6 16 6v14H0Z" fill={theme.wave} opacity="0.75" />
    </svg>
  );
}
