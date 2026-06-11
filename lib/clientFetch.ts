const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error("NEXT_PUBLIC_API_URL이 설정되지 않았습니다.");
}

export async function clientFetch(
  endpoint: string,
  options: RequestInit = {},
) {
  const { headers, ...rest } = options;

  return fetch(`${API_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    credentials: "include",
    ...rest,
  });
}