import type { ApiResponse, User } from "@/types/auth";

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080").replace(/\/$/, "");

export async function fetchMe(): Promise<User> {
  const res = await fetch(`${API_BASE}/api/v1/auth/me`, {
    credentials: "include",
  });

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