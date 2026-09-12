const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!API_URL) {
  throw new Error("NEXT_PUBLIC_API_BASE_URL이 설정되지 않았습니다.");
}

const REFRESH_ENDPOINT = "/api/v1/auth/refresh";

// 세션이 만료(또는 로그인 필요)돼 401이 오면 로그인 페이지로 보낸다.
// /login에서 발생한 401은 리다이렉트 루프를 막기 위해 무시한다.
function redirectToLoginIfSessionExpired(status: number) {
  if (status !== 401) return;
  if (typeof window === "undefined") return;
  if (window.location.pathname.startsWith("/login")) return;

  const returnUrl = `${window.location.pathname}${window.location.search}`;
  window.location.href = `/login?notice=session&returnUrl=${encodeURIComponent(returnUrl)}`;
}

// access 토큰(1시간)이 만료돼도 refresh 쿠키(30일)가 살아 있으면 서버가 새 쿠키를 내려준다.
// 동시에 여러 요청이 401을 받아도 재발급은 한 번만 하도록 진행 중인 약속을 공유한다.
let refreshInFlight: Promise<boolean> | null = null;

export function refreshSession(): Promise<boolean> {
  if (!refreshInFlight) {
    refreshInFlight = fetch(`${API_URL}${REFRESH_ENDPOINT}`, {
      method: "POST",
      credentials: "include",
    })
      .then((res) => res.ok)
      .catch(() => false)
      .finally(() => {
        refreshInFlight = null;
      });
  }
  return refreshInFlight;
}

export interface ClientFetchOptions extends RequestInit {
  /**
   * 로그인 없이도 보여야 하는 화면(홈·공유 코스 등)에서 쓰는 요청.
   * 401이 와도 재발급·로그인 리다이렉트를 하지 않고 응답을 그대로 돌려준다.
   * 백엔드에 아직 없는 엔드포인트는 404가 아니라 401로 오기도 해서, 이 옵션이 없으면
   * 홈에 들어온 비로그인 방문자를 로그인 페이지로 쫓아낸다.
   */
  publicEndpoint?: boolean;
}

export async function clientFetch(
  endpoint: string,
  options: ClientFetchOptions = {},
) {
  const { headers, publicEndpoint = false, ...rest } = options;
  // multipart(FormData)는 브라우저가 boundary를 붙인 Content-Type을 직접 넣어야 해서
  // 기본 JSON 헤더를 달지 않는다.
  const isFormData = typeof FormData !== "undefined" && rest.body instanceof FormData;

  const request = () =>
    fetch(`${API_URL}${endpoint}`, {
      headers: {
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
        ...headers,
      },
      credentials: "include",
      ...rest,
    });

  let res = await request();
  if (publicEndpoint) return res;

  // 만료된 access 토큰이면 조용히 재발급하고 원래 요청을 한 번만 다시 보낸다.
  // 그래도 401이면 진짜 로그아웃 상태라 로그인 페이지로 보낸다.
  if (res.status === 401 && endpoint !== REFRESH_ENDPOINT && (await refreshSession())) {
    res = await request();
  }

  redirectToLoginIfSessionExpired(res.status);

  return res;
}
