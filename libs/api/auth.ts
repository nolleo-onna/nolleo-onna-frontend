import { refreshSession } from "@/libs/clientFetch";

import type { ApiResponse, User } from "@/types/auth";

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080").replace(/\/$/, "");

// 로그인 여부 판별용이라 401이어도 로그인 페이지로 보내지 않는다(clientFetch를 안 쓰는 이유).
// 대신 access 토큰만 만료된 경우는 재발급 후 한 번 더 시도해 멀쩡한 세션을 로그아웃으로 오판하지 않는다.
export async function fetchMe(): Promise<User> {
  const getMe = () => fetch(`${API_BASE}/api/v1/auth/me`, { credentials: "include" });

  let res = await getMe();
  if (res.status === 401 && (await refreshSession())) {
    res = await getMe();
  }

  if (!res.ok) {
    throw new Error("UNAUTHORIZED");
  }

  const response = (await res.json()) as ApiResponse<User>;

  return response.data;
}

export async function logout(): Promise<void> {
  const res = await fetch(`${API_BASE}/api/v1/auth/logout`, {
    method: "POST",
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("LOGOUT_FAILED");
  }

}