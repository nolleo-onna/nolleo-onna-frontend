import { cookies } from "next/headers";

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!API_URL) {
  throw new Error("NEXT_PUBLIC_API_BASE_URL이 설정되지 않았습니다.");
}

export async function serverFetch(
  endpoint: string,
  options: RequestInit = {},
) {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  const { headers, ...rest } = options;

  return fetch(`${API_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...(cookieHeader && { Cookie: cookieHeader }),
      ...headers,
    },
    ...rest,
  });
}