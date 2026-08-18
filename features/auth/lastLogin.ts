import { OAUTH_URLS, type OAuthProvider } from "@/constants/auth";

// 마지막으로 "성공한" 로그인 수단 (localStorage — 브라우저에 계속 남음)
const LAST_LOGIN_KEY = "auth:lastLoginProvider";
// 방금 클릭해서 "시도 중인" 수단 (sessionStorage — 콜백에서 성공 확인 후 승격)
const PENDING_LOGIN_KEY = "auth:pendingLoginProvider";

function isProvider(value: string | null): value is OAuthProvider {
  return value !== null && value in OAUTH_URLS;
}

/** 이 브라우저에서 마지막으로 로그인에 성공한 수단. 없으면 null(첫 방문자) */
export function getLastLoginProvider(): OAuthProvider | null {
  if (typeof window === "undefined") return null;
  const value = localStorage.getItem(LAST_LOGIN_KEY);
  return isProvider(value) ? value : null;
}

/** 소셜 버튼 클릭 시 호출 — 아직 성공은 아니므로 pending으로만 기록 */
export function markLoginAttempt(provider: OAuthProvider) {
  sessionStorage.setItem(PENDING_LOGIN_KEY, provider);
}

/** OAuth 콜백에서 로그인 성공이 확인됐을 때 호출 — pending을 확정 기록으로 승격 */
export function commitLoginSuccess() {
  const pending = sessionStorage.getItem(PENDING_LOGIN_KEY);
  sessionStorage.removeItem(PENDING_LOGIN_KEY);
  if (isProvider(pending)) {
    localStorage.setItem(LAST_LOGIN_KEY, pending);
  }
}
