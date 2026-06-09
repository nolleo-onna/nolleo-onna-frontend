const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080").replace(/\/$/, "");

export const OAUTH_URLS = {
	kakao: `${API_BASE}/oauth2/authorization/kakao`,
	naver: `${API_BASE}/oauth2/authorization/naver`,
	google: `${API_BASE}/oauth2/authorization/google`,
} as const;

export type OAuthProvider = keyof typeof OAUTH_URLS;