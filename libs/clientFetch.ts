const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!API_URL) {
  throw new Error("NEXT_PUBLIC_API_BASE_URL이 설정되지 않았습니다.");
}

// 세션이 만료(또는 로그인 필요)돼 401이 오면 로그인 페이지로 보낸다.
// /login에서 발생한 401은 리다이렉트 루프를 막기 위해 무시한다.
function redirectToLoginIfSessionExpired(status: number) {
  if (status !== 401) return;
  if (typeof window === "undefined") return;
  if (window.location.pathname.startsWith("/login")) return;

  const returnUrl = `${window.location.pathname}${window.location.search}`;
  window.location.href = `/login?notice=session&returnUrl=${encodeURIComponent(returnUrl)}`;
}

export async function clientFetch(
  endpoint: string,
  options: RequestInit = {},
) {
  const { headers, ...rest } = options;
  // multipart(FormData)는 브라우저가 boundary를 붙인 Content-Type을 직접 넣어야 해서
  // 기본 JSON 헤더를 달지 않는다.
  const isFormData = typeof FormData !== "undefined" && rest.body instanceof FormData;

  const res = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...headers,
    },
    credentials: "include",
    ...rest,
  });

  redirectToLoginIfSessionExpired(res.status);

  return res;
}